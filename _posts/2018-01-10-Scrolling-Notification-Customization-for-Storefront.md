---
layout: post
title: Scrolling Notification Customization for Storefront
categories:
- Citrix
tags:
- C#
- Citrix
---

I found [this post](https://www.citrix.com/blogs/2016/03/21/storefront-message-customization/) while looking for different custom solutions to notify our end users of changes to the Citrix environment or outages related to published applications. As you can see from my simple, static blog while I definitely appreciate well designed web styles; I am not a huge fan of writing CSS and figuring out what works (or doesn't) with different browsers, etc. Anyway, after downloading this tool and playing around with  it I figured it would work for the team to leverage to easily publish notifications for the end users.

I liked the functionality but I wanted a self contained solution and a few more formatting options so I borrowed this idea and wrote this tool to encompass what was already done and add a little more. This also gave me an excuse to finally dip my toe into WPF. I did not modify much of the look/feel of the original as it works well. If it ain't broke...



### Modify receiver.html

Most everyone should already have it, but you will need at least .NET 4.5 Framework installed on the SF server(s).

First thing to do is modify the **receiver.html** file. In the original post, this was done with a separate PowerShell script, but I added it to the tool. Click on the `Modify receiver.html` button and it will prompt you to select the target file (in case you have multiple stores), make a backup copy of the current one and make the following modification:

Replace 

```html
<div id=”pluginTop”><div id=”customTop”></div></div>
```

with the following 

```html
<div id=”pluginTop”><div id=”customTop”><div class=”StoreMarquee”><span></span></div></div></div>
```

If you have multiple Storefront servers, you will need to copy the updated file to each server or run the tool separately on each server.



### Multiple Storefront Servers

If you want to publish the notification to multiple Storefront servers, you will need to create a **Publish.txt** file in the same directory as this utility. Enter the following path to each server as shown below; one server per line replacing [StoreName] with the actual name of your store:

**\\\server01.corp.net\C$\inetpub\wwwroot\Citrix\\[StoreName]Web\custom\style.css**

**\\\server02.corp.net\C$\inetpub\wwwroot\Citrix\\[StoreName]Web\custom\style.css**

**\\\server02.corp.net\C$\inetpub\wwwroot\Citrix\\[StoreName]Web\custom\style.css**



### Using the tool

Once the preliminary stuff is done, simply launch the tool, open the **style.css** file using the button on top and set up your notification. Enter the message in the text window and modify the colors, font styles, and sizes using the controls. Set the Banner State to Enabled or Disabled and then click `Apply`. If you have multiple Storefront servers, click the `Publish` button to push it to the other servers. As shown below, the tool will also preview what the banner will look like before you publish it.

***Note:*** If you have a long notification, you might find that the scrolling needs to be slowed down a bit. You can do this by manually modifying the following lines in the **style.css** file after you apply your changes and before you publish. Change the **30s** to however many seconds works best.

```css
animation: StoreMarquee 30s linear infinite;
-moz-animation: StoreMarquee 30s linear infinite;
-webkit-animation: StoreMarquee 30s linear infinite;
```



![Storefront Custom Banner](http://assets.afinn.net/sf-custom-banner.png)	

