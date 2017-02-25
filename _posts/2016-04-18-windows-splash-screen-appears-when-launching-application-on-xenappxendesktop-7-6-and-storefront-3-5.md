---
layout: post
title: Windows Splash Screen Appears When Launching Application on XenApp/XenDesktop 7.6 and Storefront 3.5
redirect_from:
- "/2016/04/windows-splash-screen-appears-when-launching-application-on-xenappxendesktop-7-6-and-storefront-3-5/"
- "/index.php/2016/04/18/windows-splash-screen-appears-when-launching-application-on-xenappxendesktop-7-6-and-storefront-3-5/"
date: 2016-04-18 10:29:54.000000000 -05:00
categories:
- Citrix
tags:
- Citrix
---
After upgrading Storefront from 2.5 to 3.5, I noticed that all published applications where the VDA was running on Windows 2012R2 started displaying the Windows logon process in a splash screen.![alt text](http://assets.afinn.net/win2012r2_splashscreen.png "win2012r2_splashscreen")



The application continued to launch successfully, but this splash screen did not start appearing until after the Storefront upgrade. This also did not occur on VDA's running on Windows 2008R2, only 2012 servers. The fix was to update the following registry key on the VDA:<br />
**Key**: HKEY_LOCAL_MACHINE\\SOFTWARE\\Wow6432Node\\CitrixLogon<br />
**Name:** DisableStatus<br />
**Type:** REG_DWORD<br />
**Value:** 0x00000000