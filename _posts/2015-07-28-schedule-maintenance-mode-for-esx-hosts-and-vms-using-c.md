---
layout: post
title: Schedule Maintenance Mode for ESX hosts and VM's Using C#
date: 2015-07-28 11:00:37.000000000 -05:00
categories:
- SCOM 2012
tags:
- C#
- Maintenance Mode
- scom2012

---
If you manage SCOM, you are all too familiar with the lack of functionality to easily schedule maintenance mode with a future start time. While there are several good PowerShell scripts available a-la Google to facilitate some semblance of scheduling, I've always wondered why MS did not include this functionality into the base product. As many SCOM admins know, the platform can get fairly complex pretty quickly as management packs are added, written, customized, etc. This complexity makes customizing a scheduling tool for maintenance even more fun when we start to step outside the good old Microsoft.Windows.Computer class.

Veeam has a pretty slick <a href="http://www.veeam.com/system-center-management-pack-vmware-hyperv.html" target="_blank">management pack</a> to monitor both VMWare and Hyper-V within SCOM. I work in mainly a VMWare shop so I'll focus on that. While this integration is super cool when we go to set up alerting, dive into the dashboards, and run the reports, it adds an additional layer to contend with if we want to schedule maintenance. This main hurdle to overcome is that while putting the ESX host into MM via the VMWare class takes care of the VM's from Veeam's perspective, these VM's may also be running a Windows Agent which is NOT sub-classed within the **Veeam.Virt.Extensions.VMware** class. If you do not use the Windows Agents in favor of the monitoring solely through Veeam, then you don't have anything to worry about; however, if you do still leverage the Windows Agent, then you have an additional class to worry about with maintenance mode. What? You also run Linux VM's??? Oh, dear!

I was actually thinking closer to "Oh, s**t!" when I starting trying to bend some scripts around the maintenance scheduling because you do need to consider all possible VM OS types. As I needed to provide a way for application teams to put their own servers into maintenance, PowerShell scripts didn't really work since not everyone working on the application is a PS wizard so I created a web application that allows them to manage their maintenance mode. The backend is C Sharp and although I did something similar several years ago in SCOM 2007, I found that 2012 was a bit easier as we don't have to explicitly contend with the Health Watcher and can simply work with the MonitoringObject class for maintenance methods. The following function demonstrates placing not only the ESX host in MM via Veeam, but also demonstrates recursively enumerating the <a href="https://msdn.microsoft.com/en-us/library/microsoft.enterprisemanagement.monitoring.partialmonitoringobjectbase.getrelatedmonitoringobjects.aspx" target="_blank">PMO.GetRelatedMonitoringObjects</a> and placing them into MM via the <a href="https://msdn.microsoft.com/en-us/library/microsoft.enterprisemanagement.monitoring.monitoringobject.aspx" target="_blank">MonitoringObject</a> class.

```csharp
public static void GetVMListForMM(string targetName, DateTime dtmNow, DateTime dtmTimeWindow, MaintenanceModeReason reason, string scheduledComment)
        {
            try
            {
                Microsoft.EnterpriseManagement.ManagementGroup managementGroup = new Microsoft.EnterpriseManagement.ManagementGroup(ConfigurationManager.AppSettings["ManagementServer"]);
                ManagementPackClassCriteria criteria = new ManagementPackClassCriteria("Name = 'Veeam.Virt.Extensions.VMware.VMHOST'");
                IList<ManagementPackClass> classes = managementGroup.EntityTypes.GetClasses(criteria);
                List<MonitoringObject> list = new List<MonitoringObject>();
                List<PartialMonitoringObject> monitoringObjects = new List<PartialMonitoringObject>();
                List<string> duplicatelist = new List<string>();
                IObjectReader<MonitoringObject> objectReader = managementGroup.EntityObjects.GetObjectReader<MonitoringObject>(classes[0], ObjectQueryOptions.Default);
                list.AddRange((IEnumerable<MonitoringObject>)objectReader);
                foreach (PartialMonitoringObject monitoringObject in list)
                {
                    if (monitoringObject.DisplayName.ToLower() == targetName.ToLower())
                    {
                        foreach (MonitoringObject relatedVMObject in monitoringObject.GetRelatedMonitoringObjects(TraversalDepth.Recursive))
                        {
                            if (relatedVMObject.ToString().Contains("VM"))
                            {
                                foreach (MonitoringObject monitoredVM in relatedVMObject.GetRelatedMonitoringObjects(TraversalDepth.Recursive))
                                {
                                    string strmonitoredVM = monitoredVM.DisplayName.ToLower();
                                    if (strmonitoredVM.Contains("domain.local") == false)
                                    {
                                        strmonitoredVM = strmonitoredVM + ".domain.local";
                                        duplicatelist.Add(strmonitoredVM);
                                    }
                                    else
                                    {
                                        duplicatelist.Add(strmonitoredVM);
                                    }
                                }
                                List<string> uniquelist = duplicatelist.Distinct().ToList();                                
                                foreach (string strmonitoredVM in uniquelist)
                                {                                    
                                    IObjectReader<MonitoringObject> readerMonitoredVM = managementGroup.EntityObjects.GetObjectReader<MonitoringObject>(new MonitoringObjectGenericCriteria("Name='" + strmonitoredVM + "'"), ObjectQueryOptions.Default);
                                     monitoringObjects.AddRange(readerMonitoredVM);
                                    foreach(MonitoringObject mo in monitoringObjects.Distinct().ToList())
                                    {
                                        if (!mo.InMaintenanceMode)
                                        {
                                            if (!mo.FullName.ToLower().Contains("dhcp")) //Found this was needed to handle objects discovered by the DHCP management pack.
                                            {
                                                mo.ScheduleMaintenanceMode(dtmNow, dtmTimeWindow, reason, scheduledComment,TraversalDepth.Recursive);
                                            }
                                        }
                                    }
                                    monitoringObjects.Clear();
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Handle or log exception
            }
            finally
            {
                // Code to wrap it up
            }
        }
```


Slap a few more methods in there to handle other objects like groups or explicit OS classes directly and pop a little web front end on it and you have a self-service application that allows the different application teams to directly place their servers into maintenance mode without granting access to the SCOM console or requiring them to RDP to a server to run a PowerShell script to schedule a task.