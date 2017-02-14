---
layout: post
title: Citrix User Store Profile Cleaner
categories:
- Citrix
tags:
- UPM
- Profiles
---

So you were probably redirected here and are wondering where is the tool? 

While I did have something written in C#, it was kind of a pain to keep updating and seemed to have grown into something overly complicated. So... I decided to re-write it in Powershell. It is a side project but I should have something set to release before too long.

There are definitely other cool versions of something like this you can find, but they seemed to do one or two things and not everything. For example, it would clean excluded files but not excluded directories, or it would work with local UPM settings, but not really integrate with AD policies, etc. I want a tool that I can clean one or all profiles and clean files and directories that are excluded. Therefore, I cracked open ISE and off I went.

Sorry for the inconvenience; hope you find it worth the wait when ready. 