---
layout: post
title: Purging Kerberos Ticket Cache on Remote Machines
date: 2015-08-05 14:49:43.000000000 -05:00
categories:
- Scripting
tags:
- Kerberos
- Powershell
- Scripting
---

I was recently asked to help the DBA and Storage teams with an issue related to backup authentication. From what I was told, they had been testing different authentication methods to access a Data Domain device as backup target on several SQL clusters. When attempting to normalize everything using a single account and authentication mechanism, they were running into authentication issues getting back to the share on the Data Domain due to cached  Kerberos tickets. The vendor recommended that they purge the Kerberos cache on each of the devices to clear the tickets. The kicker was that there were quite a few servers involved in this issue so logging on and manually running klist.exe would have been fairly time consuming. The DBA's were not very keen on my first suggestion to just remotely reboot the passive nodes and let clustering work it's magic. They responded by calling me crazy and making absurd claims about production outage this and change control that, etc. Geesh (chuckle)!

Having been shot down as a cluster-reboot-comedian, I threw together the following script to remotely run klist on each of the servers via Invoke-Method:

```powershell
<#
	.SYNOPSIS
		Deletes all current kerberos tickets on specified machines
	
	.DESCRIPTION
		Uses klist.exe to purge Kerberos tickets on designated servers/workstations.
	
	.PARAMETER Targets
		String array of computer names.
	
	.EXAMPLE
		PS C:> .Remove-KerbTickets -Targets Server01, Server01, Server03

	.EXAMPLE
		PS C:> $arr = Get-ADComputer -LDAPFilter "(name=*FS01)" | Select-Object -ExpandProperty name
	 	PS C:> $arr | .Remove-KerbTickets.ps1
#>
	
[CmdletBinding()]
param
(
	[Parameter(Mandatory = $true,
			   ValueFromPipeline = $true)]
	[string[]]$Targets
)

process {
	$CurrentSessions = @()
	
	$scriptcontent = { param ($SessionItem); klist -li $SessionItem purge}
	
	foreach ($Server in $Targets) {
		$Error.Clear()
		$CurrentLogonSessions = Get-WmiObject -ComputerName $Server -Class Win32_LogonSession -ErrorAction SilentlyContinue
		
		if (!$Error) {
			foreach ($Session in $CurrentLogonSessions) {
				$UserID = [convert]::ToString($Session.LogonID, 16) # Convert the LogonID value from decimal to hex
				$UserID = '0x' + $UserID # Append hex char to the string
				$CurrentSessions += $UserID # Add string to the array
			}
			
			foreach ($SessionItem in $CurrentSessions) {
				$Error.Clear()
				$results = Invoke-Command -ComputerName $Server -ScriptBlock $scriptcontent -ArgumentList $SessionItem -ErrorAction SilentlyContinue
				If ($Error[0].Exception.Message -match "The client cannot connect") {
					Write-Host "$Server - Unable to connect via WinRM"
					break
				}
				<# Example placeholder to handle klist errors				
				if ($results -match "0xc000005f") {
					Write-Host "Session no longer exists or may have been terminated."	
				}
				#>
				if ($results -match "purged") {
					Write-Host "$Server - Ticket(s) purged"
				}
			}
			$Error.Clear()
		}
		else {
			Write-Host "$Server - WMI Error: $($Error[0].Exception.Message)"
		}
	}
	$CurrentSessions.Clear()
}
```
