---
layout: post
title: Netscaler 10.5 and Windows 2012 R2 SChannel Errors with TLS 1.2
date: 2015-12-28 19:11:31.000000000 -06:00
categories:
- Citrix
tags:
- cipher suite order
- Citrix
- Netscaler
- TLS
---
<p>So as part of a recent upgrade I was performing, I upgraded a couple of Netscaler Access Gateways from version 10.1 to version 10.5. The upgrade went very smoothly, no errors, no user calls… for a while. The next day, we started receiving some calls regarding issues with launching apps via Storefront. Some users were receiving the “SSL Error 43: The proxy denied access to…” error with their STA ticket when clicking on their application icons on the web page.</p>
<p>Tracking down the servers based on their STA ID in the ticket, I noticed that users only had issues when they were attempting to authenticate to Windows 2012 R2 delivery controllers. The Windows 2008 R2 delivery controllers were not denying the STA requests. Jumping on one of the Windows 2012 R2 delivery controllers, I noticed the System event log was flooded with Schannel errors for Event ID’s 36874 <em>(An TLS 1.2 connection request was received from a remote client application, but none of the cipher suites supported by the client application are supported by the server. The SSL connection request has failed.) </em>and 36888 <em>(A fatal alert was generated and sent to the remote endpoint. This may result in termination of the connection. The TLS protocol defined fatal error code is 40. The Windows SChannel error state is 1205.)</em>.</p>
<p>Well, we obviously have an SSL issue, but these codes aren’t exactly pointing me anywhere. Looking up the error code on the RFC page for the TLS protocol (<a href="http://tools.ietf.org/html/rfc5246">http://tools.ietf.org/html/rfc5246</a>) I found that error code 40 is a handshake failure (you can find this in the A.3 part of the appendix in the Alert Messages section). I can’t remember where exactly I found the enum definition for the Schannel 1205 code, but it basically means that a fatal error was send to the endpoint and the connection was being forcibly terminated. At least I now knew there was an issue with the SSL handshake between the Netscalers and the Windows 2012 R2 delivery controllers. Time for some network tracing.</p>
<p>Firing up Wireshark on the delivery controller, I could see that the connection was getting immediately reset by the server after the <strong>Client Hello</strong> from the Netscaler.</p>
<p><a href="https://vj4pja.dm1.livefilestore.com/y3mPXUxkTAk7P7cRGz-5y7yHOpmFsBS5nwNZRLnGB6W9QItv2EdzM6pu72_8GzpqGpazp416Y8YLSa07983PdK3U0MPFOixyTXBLBxgdfGl7mAvqzdiJssfWQNufw40uAkBLl-Z2ziQ5Y14ygehq9tjlmKak5fDMqsFK5n7EkMTl6E?width=256&height=25&cropmode=none" rel="attachment wp-att-109"><img class="aligncenter size-full wp-image-109" src="https://vj4pja.dm1.livefilestore.com/y3mPXUxkTAk7P7cRGz-5y7yHOpmFsBS5nwNZRLnGB6W9QItv2EdzM6pu72_8GzpqGpazp416Y8YLSa07983PdK3U0MPFOixyTXBLBxgdfGl7mAvqzdiJssfWQNufw40uAkBLl-Z2ziQ5Y14ygehq9tjlmKak5fDMqsFK5n7EkMTl6E?width=256&height=25&cropmode=none" alt="Windows_2012_R2_RST_ACK" width="1099" height="107" /></a></p>
<p>Expanding the <strong>Client Hello</strong> packet in the capture, I could see a list of ciphers currently being offered by the Netscaler. <em>(Note – for the sake of easier troubleshooting, I left the default grouping of ciphers in place as it was a large group of widely accepted ciphers until I identified the issue and then trimmed down the cipher list. You should limit the number of ciphers available on the virtual server of your Access Gateway to just what you need and leverage the more current stronger methods available such as AES 256 over RC4 and MD5, etc. if possible.)</em></p>
<p><a href="https://1drv.ms/i/s!AkAdWw6x2dAVunekGZRiPk-3tL9N" rel="attachment wp-att-107"><img class="aligncenter size-full wp-image-107" src="https://1drv.ms/i/s!AkAdWw6x2dAVunekGZRiPk-3tL9N" alt="Cipher suites" width="405" height="263" /></a></p>
<p>Next, I configured the <strong>SSL Cipher Suite Order</strong> on the windows server to match what the Netscaler was presenting in the <strong>Client Hello</strong> packet, at least the top 10 or so. This can be done using either <strong>gpedit.msc</strong> for local policy or via the <strong>Group Policy Management Console</strong> as follows:</p>
<ol>
<li>In either editor, expand <strong>Computer Configuration/Administrative Templates/Network.</strong></li>
<li>Click on <strong>SSL Cipher Suite Order</strong> in the <strong>SSL Configuration Settings</strong></li>
<li>Select the <strong>Enabled</strong> option and then follow the instructions in the <strong>Help</strong> section of the policy. Basically, all the ciphers you want will be listed on a single line separated by commas with no spaces anywhere.</li>
<li>You must reboot the server for the changes to take effect.</li>
</ol>
<p><a href="https://1drv.ms/i/s!AkAdWw6x2dAVuntTUbLzvI6WEhas" rel="attachment wp-att-108"><img class="aligncenter size-full wp-image-108" src="https://1drv.ms/i/s!AkAdWw6x2dAVuntTUbLzvI6WEhas" alt="SSL Cipher Order Policy" width="560" height="514" /></a></p>
<p>Even after the reboot, the SChannel errors were still present and the network captures were still showing the handshake failing due to a reset from the server. I’ll save you the time you will spend on re-ordering the ciphers on both the Netscaler and the Windows Server 2012 R2 Delivery Controller along with the multitude of reboots that go with it; it simply won’t work (at least at the time I published this).</p>
<p>I stepped back and decided to try tweaking the TLS protocol versions since I wasn’t getting anywhere with the cipher suites (key exchange algorithms). For the sake of brevity, after much additional testing, headbanging, and googling I was able to get the handshake to work when I disabled TLS 1.2 on the Windows 2012 server. This forced the server to renegotiate using TLS 1.1 with the Netscaler which worked with the cipher suites I tested with that were supported by both the OS and the Netscaler. I did find a nice article supporting this <a href="http://www.jasonsamuel.com/2015/10/15/citrix-netscaler-10-5-to-11-0-firmware-upgrade-issues-to-watch-out-for/">here</a> for additional reference.</p>
<p>To disable TLS 1.2 on the server, you need to modify a registry key:</p>
<ol>
<li>Go to <strong>HKLM\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols</strong>.</li>
<li>If the <strong>TLS 1.2</strong> key does not exists, create it.</li>
<li>Inside the <strong>TLS 1.2 </strong>key, create another key called <strong>Client</strong>.</li>
<li>Within the <strong>Client</strong> key, create two <strong>REG_DWORD</strong> values:
<ol>
<li>DisabledByDefault (set value to 1).</li>
<li>Enabled (set value to 0).</li>
</ol>
</li>
</ol>
<p>You will need to reboot one more time for the changes to take effect. This finally cleared up my SChannel errors as well as allowed me to add the controllers back as STA’s in the virtual server; in a green status this time.</p>
