---
layout: post
title: Command Line Wrapper for DHCP Administration
categories:
- scripting
tags:
- Scripting
- PowerShell
- DHCP
---

So, um... yeah. I took a ~~really long vacation/retirement~~ little break from the last time I posted. This has always been more of a hobby where I play with different platforms (currently Jekyll) and post things that I would like to refer back to later but I've misplaced my original notes. The fact that I use OneNote with OneDrive storage for my notes pretty much prevents me from losing anything now; hence, they latency in posting. Well, with Microsoft's recent track record of outages across O365 as well as Azure, that may remain to be seen.

Anyway, I was recently in an environment where DHCP was run as a localized service in each physical location on a dedicated server. The sprawl that had crept in over the years made administration, backup, and recovery loads fun to the factor of suck. ![fun to the suck](https://s3.amazonaws.com/alan-finn.github.io/fun_to_the_suck.png)

So, the admins were in the process of collapsing these servers into two main DHCP servers located in two different datacenters which leverage MS DHCP replication/failover. This was working very nicely until we noticed that as the number of managed scopes increased, so did the time it took for the DHCP Admin snap-in to load. As there were going to be well over a thousand scopes when finished, adding a reservation was going to need it's own budget code to charge time against while the MMC loaded.

To work around this, I leveraged the PowerShell DHCP Server cmdlets and wrapped a command-line-type menu around it for selecting tasks. As the cmdlets are only available when the RSAT DHCP Admin tools are installed, I leveraged remoting to eliminate the need for the RSAT tools very similarly to how the Exchange Admin tools work in PowerShell. Keep in mind that this was only written to wrap a few cmdlets into a simple command line menu for speeding up administration outside of the MMC. It can, however, be easily modified to add more functionality if desired. The usual "use at your own risk" and "I am not responsible if you blow up production" disclaimers apply.

[DHCPUtility](https://gist.github.com/alan-finn/fb38da2f8ec6e3642f2b1fea0fca710e)