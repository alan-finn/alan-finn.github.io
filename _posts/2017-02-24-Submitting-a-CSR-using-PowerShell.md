---
layout: post
title: Submitting a CSR using PowerShell
date: 2017-02-24 16:15:43.000000000 -05:00
categories:
tags:
- Certificates
- PKI
- Scripting
---

In a recent redesign of a PKI infrastructure, I engaged Microsoft to help implement some best practices as the previous PKI design had been setup by the "guy who knows the most about certificates" about a decade ago.

As part of this process, the PFE stated that the use of the **certsrv** web page is being deprecated within Microsoft in favor of command line and MMC functionality. With that in mind, I made it a point to publish templates that were only absolutely necessary and focus on the site being an easy point to download the chain and CRL and that's about it. It was funny how quickly I realized I used that webpage way more than I thought I did.

To keep me from having to constantly refer to Technet or keep using *certreq /?* all the time, I put together this quick PowerShell script to help automate the process. I also added a little Windows Forms integration so that I could allow some of the application teams to request their own certs instead of constantly requesting new ones for testing, etc.

This isn't groundbreaking or anything and it isn't the first script with this functionality, but it saves me a bit of time :).

```powershell
#requires -Version 3.0

function Get-CertificateRequestFile {
  param (
    [string]$InitialDirectory = $PSScriptRoot
  )
  [System.Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms") | Out-Null
  $ShowDialog = New-Object System.Windows.Forms.OpenFileDialog
  $ShowDialog.InitialDirectory = $InitialDirectory
  $ShowDialog.Filter = "CSR File (*.csr)|*.csr|Request File (*.req)|*.req|Text File (*.txt)|*.txt|All Files (*.*)|*.*"
  $ShowDialog.ShowDialog() | Out-Null
  return $ShowDialog.FileName
}


function Get-CertificateTemplates {
  $script:IssuingCA = certutil -config - -ping
  $script:IssuingCA = $script:IssuingCA | Where-Object { ($_ -match '\\') -and ($_ -notmatch 'Connecting')}
  $TemplateList = certutil -CATemplates -config $script:IssuingCA
  return $TemplateList
}

$script:IssuingCA = ""
$TemplateItems = @{}
$i = 0
$RequestFile = Get-CertificateRequestFile
$Templates = Get-CertificateTemplates

foreach ($Template in $Templates) {
  if ($Template.Contains("--")) { 
    $CurrentItem = $Template -split ' -- '
    $TemplateItems.Add($i,$CurrentItem[0])
    $i++
  }
} 
do { 
  Clear-Host
  Write-Output "`n"
  Write-Output "Selected Certificate Authority: $script:IssuingCA`n"
  $TemplateItems.GetEnumerator() | Sort-Object Name | ForEach-Object {Write-Output (" {0} - {1}" -F $_.Key, $_.Value)}
  $SelectedItem = Read-Host -Prompt "`nSelect the number for the requested template (CTRL+C to quit)"
  if ($SelectedItem -notin @(0..$i)) { 
    $CurrentUIColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = 'Yellow'
    Write-Output "Please select a valid number or CTRL+C to quit.." 
    $Host.UI.RawUI.ForegroundColor = $CurrentUIColor
    Start-Sleep -Seconds 2
  }
} while ($SelectedItem -notin @(0..$i))

$results = $TemplateItems.GetEnumerator() | Where-Object { $_.Key -eq $SelectedItem}
$SelectedTemplate = ($($results.Value -split ':')[0]).Trim()

certreq -submit -config $script:IssuingCA -attrib "CertificateTemplate:$SelectedTemplate" $RequestFile

Clear-Variable TemplateItems
```