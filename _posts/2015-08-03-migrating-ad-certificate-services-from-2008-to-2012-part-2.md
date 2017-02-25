---
layout: post
title: Migrating AD Certificate Services from 2008 to 2012 – Part 2
redirect_from: "/index.php/2015/08/03/migrating-ad-certificate-services-from-2008-to-2012-part-1-2/"
date: 2015-08-03 18:50:37.000000000 -05:00
categories: []
tags:
- Certificates
- PKI
---
I put these steps together using information and videos from this site <a href="http://blogs.technet.com/b/xdot509/">http://blogs.technet.com/b/xdot509/.</a>

1. On the 2008 CA, create the following directory structure:

     a. C:\\CABackupDatabase<br />
     b. C:\\CABackupConfig

2. Open the **Certification Authority** snap-in, right click on the CA name, and select **Properties**.<br />![alt text](http://assets.afinn.net/backup_ca-1.png "backup_ca")

   ​


3.    Click Next when the wizard launches.

4.    At the next screen, check the boxes next to **Private key and CA certificate** and **Certificate database and certificate database log**. Select the *C:\\CABackupDatabase* folder created in Step 1. Click **Next**.![alt text](http://assets.afinn.net/ca_items_to_backup-1.png "ca_items_to_backup")

         ​


5. Enter a password to secure the private key and CA certificate. Click **Next**.

6. Verify that the certificate and database files were exported in the target directory.

7. Export the **HKLMSYSTEMCurrentControlSetServicesCertSvcConfiguration<CA Name>** key to the *C:\\CABackupConfig* directory created in Step 1.<br />![alt text](http://assets.afinn.net/ca_config_regkey-1.png "ca_config_regkey")

   ​


8. Copy the *C:\\CABackup* directory to the Windows 2012 server.

9. I maintained the same servernames for my CA’s when I migrated so we’ll do the same here. Rename the Windows 2012 CA server to the same computer name as the 2008 root CA. As these are both offline and not joined to a domain, there shouldn’t be any naming collision in AD. If there is a static A record in DNS, that will need to be updated if the IP address is different.

10. Add the **Active Directory Certificate Services **role to the Windows 2012 server.

11. After restarting, finish the configuration of the ADCS.

12. Select **Certificate Authority**, then **Next**.<br />![alt text](http://assets.afinn.net/ca_role-1.png "ca_role")<br /><br />



13.  Accept the default option for **Standalone CA** as the server is not domain joined and click

14.  Select **Root CA** as the CA Type and click **Next**.

15.  At the *Specify the type of the private key* screen, select **Use existing private key** and the option **Select a certificate and use its associated private key**. Click **Next**.<br />![alt text](http://assets.afinn.net/select_cert_privatekey-1.png "select_cert_privatekey")<br /><br />

16.  Click the **Import **button and browse to the pfx certificate backed up from the Windows 2008 root CA. Enter the password then click It will take a few seconds for the certificate to appear, when it does, select the certificate name and click **Next**.<br />![alt text](http://assets.afinn.net/import_cert_pass-1.png "import_cert_pass")<br /><br />

17.  Accept the defaults for the database and log locations or specify a different location. Click **Next**.<br />![alt text](http://assets.afinn.net/specify_ca_database-1.png "specify_ca_database")<br /><br />

18.  Verify the settings in the **Confirmation** page and click the **Configure**

19.  When the process completes, launch the **Certification Authority **mmc and verify the CA is visible and started.

20.  Right click on the name of the CA and select **All Tasks/Restore CA**.

21.  Click **OK** to stop the services.

22.  When the wizard launches, select the checkbox next to **Certificate database and certificate database log**. Browse to the location of the database files backed up from the Windows 2008 Root CA. Click **Next**.<br />![alt text](http://assets.afinn.net/items_to_restore-1.png "items_to_restore")<br /><br />

     ​

23.  Click **Finish** to start the process.

24.  Select **Yes** to start the services when prompted.

25.  On the Windows 2012 root CA, export the same registry key from Step 7.

26.  Go the C:\\CABackupConfig folder on the Windows 2012 root CA server, right click on the .reg file and select **Merge**.

27.  In the **Certification Authority** mmc, right click the server name and stop, then start the services one more time.

28.  This will create a new CRL which can be copied to the CRL Distribution Points.

29.  If any scripts were previously copied over, they may be restored now.

