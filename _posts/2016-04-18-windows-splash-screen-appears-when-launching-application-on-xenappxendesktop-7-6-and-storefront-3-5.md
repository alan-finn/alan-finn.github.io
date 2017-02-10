---
layout: post
title: Windows Splash Screen Appears When Launching Application on XenApp/XenDesktop 7.6 and Storefront 3.5
date: 2016-04-18 10:29:54.000000000 -05:00
categories:
- Citrix
tags:
- Citrix
---
After upgrading Storefront from 2.5 to 3.5, I noticed that all published applications where the VDA was running on Windows 2012R2 started displaying the Windows logon process in a splash screen.![alt text](http://assets.afinn.net/win2012r2_splashscreen.png "win2012r2_splashscreen")



The application continued to launch successfully, but this splash screen did not start appearing until after the Storefront upgrade. This also did not occur on VDA's running on Windows 2008R2, only 2012 servers. The fix was to update the following registry key on the VDA:
**Key**: HKEY_LOCAL_MACHINESOFTWAREWow6432NodeCitrixLogon
**Name:** DisableStatus
**Type:** REG_DWORD
**Value:** 0x00000000