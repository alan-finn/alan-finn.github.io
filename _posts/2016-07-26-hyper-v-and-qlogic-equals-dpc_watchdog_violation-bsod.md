---
layout: post
title: Hyper-V and QLogic Equals DPC_WATCHDOG_VIOLATION BSOD
categories:
- Hyper-V
tags:
- BSOD
- DPC_WATCHDOG_VIOLATION
- Hyper-V
- VMQ
---
Working with some older hardware (HP DL585 G7 and NC523 SFP 10Gb Dual Port Adapters), I ran into an issue with a Hyper-V cluster where the nodes would intermittently crash with the DPC_WATCHDOG_VIOLATION error with a 0x133 error code. The crash was guaranteed to be repeated if I manually initiated a Live Migration process. This error is essentially caused by a driver exceeding a timeout threshold. You can read more about the watchdog violation <a href="https://msdn.microsoft.com/en-us/library/windows/hardware/jj154556(v=vs.85).aspx" target="_blank">here</a> and if you're feeling really geeky, you can read about DPC objects and driver I/O <a href="https://msdn.microsoft.com/en-us/library/windows/hardware/ff544084(v=vs.85).aspx" target="_blank">here</a>.

After analyzing the memory.dmp, the stack pointed to the QLogic driver (dlxgnd64.sys). As I'm sure you would, I proceeded to update the driver for the Intelligent NIC; however, since the server was already a little over 2 years old, the latest version of the HP driver was already installed. Hmm... Next, I went to QLogic directly and looked up their number for the NC523 which they OEM for HP which turned out to be QLE3242. The driver on the QLogic site was more current so I gave that a shot. After updating I tested again with a Live Migration and once again enjoyed the lovely cornflower blue hue of the BSOD. Crap. Back to Google.

After additional digging, I found some errors in the System event log for ID 106 regarding load balanced teaming on the NIC. After a little research, I ran across <a href="https://support.microsoft.com/en-us/kb/2974384">this article</a> on MS Support. Again, I'll let you read the details but in a nutshell, the NIC's in the team were overlapping their usage of the same processors. As I was using hyper-threading, I followed the steps in the article to specify specific processors for each NIC and the max number of processors VMQ could use:

**Set-NetAdapterVMQ -Name "Ethernet1" -BaseProcessorNumber 4 -MaxProcessors 8** (VMQ would use processors 4,6,8,10,12,14,16,18)
**Set-NetAdapterVMQ -Name "Ethernet2" -BaseProcessorNumber 20 -MaxProcessors 8** (VMQ would use processors 20,22,24,26,28,30,32,34)

This did not require a restart and once I made the changes on the NIC's, I was able to Live Migrate without any crashes. I will also note that although I updated the drivers, I also tested this without updating on another Hyper-V cluster with identical hardware and the VMQ settings resolved the issue there. I burned about 6 to 8 hours banging my head on various troubleshooting items including several I didn't include here so I hope this post saves you a bit of time and headache.