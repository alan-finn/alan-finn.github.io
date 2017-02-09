---
layout: post
title: Windows Splash Screen Appears When Launching Application on XenApp/XenDesktop 7.6 and Storefront 3.5
date: 2016-04-18 10:29:54.000000000 -05:00
categories:
- Citrix
tags:
- Citrix
---
<p>After upgrading Storefront from 2.5 to 3.5, I noticed that all published applications where the VDA was running on Windows 2012R2 started displaying the Windows logon process in a splash screen.</p>
<p><a href="https://s3.amazonaws.com/afinn.net/wp-content/uploads/2016/04/18102153/win2012r2_splashscreen.png" rel="attachment wp-att-117"><img class="aligncenter wp-image-117" src="https://s3.amazonaws.com/afinn.net/wp-content/uploads/2016/04/18102153/win2012r2_splashscreen.png" alt="win2012r2_splashscreen" width="300" height="260" /></a></p>
<p>The application continued to launch successfully, but this splash screen did not start appearing until after the Storefront upgrade. This also did not occur on VDA's running on Windows 2008R2, only 2012 servers. The fix was to update the following registry key on the VDA:</p>
<p><strong>Key</strong><strong>:</strong> HKEY_LOCAL_MACHINESOFTWAREWow6432NodeCitrixLogon<br />
<strong>Name:</strong> DisableStatus<br />
<strong>Type:</strong> REG_DWORD<br />
<strong>Value:</strong> 0x00000000</p>
