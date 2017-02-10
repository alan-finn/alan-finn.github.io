---
layout: post
title: Migrating AD Certificate Services from 2008 to 2012 - Part 1
date: 2015-07-29 14:28:30.000000000 -05:00
categories: []
tags:
- Batch File
- Certificates
- PKI
---
One of the items currently on my plate is to move the PKI infrastructure from the Windows 2008 Servers which were also upgraded from Windows 2003) to Windows 2012 servers. I plan to break this process down into the following steps:


1. Remove stale requests and certificates and defrag/compact the databases on the Subordinate CA's to remove the whitespace.
2. Backup the offline Root CA certificate, keys, and database and restore to the Windows 2012 offline Root CA.
3. Backup the certificates, keys, database, custom scripts on each of the Subordinate CA's and then restore to the Windows 2012 Subordinate CA's.


This post will cover the easy part which is preparing the cleaning up and shrinking the databases. Since I have to do this more than once and will need to occasionally perform ongoing cleanup maintenance on the databases at later dates, I put the process into a simple batch file shown below. I added a lot of inline documentation because this isn't something that is done very often and I don't want to keep pulling up old articles and documentation explaining what I did the last time, plus I plan on handing this off to someone else for maintenance once the migration is completed so the script documentation will help that individual(s) as well.

As a side note, the `certutil -deleterow` process will appear to throw errors in the exit codes after it displays how may rows were affected (deleted). This is expected as there is a limitation on how many records the utility can delete at one time and if you have more records to delete than the limitation, the process triggers an error. The script below uses a loop to cycle through the process until all the specified records have been removed at which time it will complete with an exit code of 0 (zero).

```batch
@echo off
SETLOCAL ENABLEEXTENSIONS

:: *** SET THE TARGET DATE ***
REM Change the following date to reflect the date from which all prior
REM records will be removed. For example: 1/15/2014 will remove all records
REM BEFORE 1/15/2014.
SET targetdate=12/31/2014

:: *** SET THE RECORD TYPE ***
REM Change the following to reflect the type of record to be deleted.
REM I have only tested with Request and Cert but the following are available:
REM (returned from certutil -deleterow -?
REM Request - Failed and pending requests (submission date)
REM Cert    - Expired and revoked certificates (expiration date)
REM Ext     - Extension table
REM Attrib  - Attribute table
REM CRL     - CRL table (expiration date)
SET requesttype=cert

:: *** SPECIFY BACKUP OPTION ***
REM Set the following variable to "true" (no quotes) to enable backups.
SET performbackup=false

:: *** SPECIFY BACKUP TARGET LOCATION ***
REM Specify the directory path where the backup will be stored.
REM If the performbackup variable is false, this value has no effect.
SET backuploc=C:CertDBBackupDir

:: *** SPECIFY DEFRAGMENTATION OF DATABASE ***
REM Set the following variable to "true" (no quotes) to compact the database.
REM NOTE - The certificate services will be stopped for this process as the
REM CA cannot be online during compaction.
SET performdefrag=false

:: *** SPECIFY TEMP DATABASE LOCATION ***
REM Specify the directory path where current CA database is located.
REM When the process completes, the current (fragmented) database
REM will be copied to a new location and renamed with a random name.
REM If the performdefrag variable is false, this value has no effect.
SET currentdb=C:PathToCurrentCA_Database.edb

REM The certutil.exe utility has a set number of records it can delete at
REM a given time and will stop when that value is reached. To keep the
REM process continuing until all specified records are removed, we
REM implement a loop. Depending on how many records will be deleted, this
REM process can take a LONG time to complete.
:TOP
certutil -deleterow %targetdate% %requesttype%
if %ERRORLEVEL% EQU -939523027 goto TOP

REM Perform backup if specified earlier in the script.
IF "%performbackup%"=="true" (
	start /wait certutil -backupDB %backuploc%
)

REM Perform database compaction if specified earlier in the script.
IF "%performdefrag%"=="true" (
	net stop CertSvc
	start /wait esentutl /d %currentdb% &gt; results.log
        net start CertSvc
)

ECHO.
ECHO Process has completed. If database compaction was selected,
ECHO you must copy the database from the temporary location back 
ECHO to the original database location and rename it to match the
ECHO original database file name. When completed, restart the 
ECHO Certificate Services service.
ECHO .
```
