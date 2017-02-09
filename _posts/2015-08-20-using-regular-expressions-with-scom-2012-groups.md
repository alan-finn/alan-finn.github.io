---
layout: post
comments: true
title: Using Regular Expressions with SCOM 2012 Groups
date: 2015-08-20 21:08:10.000000000 -05:00
categories:
- SCOM 2012
tags:
- regex
---
<p>&nbsp;</p>
<p>A few examples of using regular expressions in group targeting in SCOM.</p>
<p><u>String pattern matching</u></p>
<p><strong>(?i:fs)</strong> – This simple pattern will match “fs” in any string and is case-insensitive. For example, DFW-FS01 would match. The parenthesis and question mark stipulate a non-capturing group. A capture group stores regex matches for use later in the expression. Since we don’t need to do anything with the match, the non-capturing group makes more sense and is optimized for this case. The <strong>i:</strong> after the question mark is a modifier that stipulates a case-insensitive match. This would effectively match <strong>fs, Fs, fS, FS</strong>.</p>
<p><strong>(?i:fs|ps)</strong> – This expands on the previous example to match alternatives in the non-capturing group. Let’s say we wanted to add both file servers and print servers into a group expression. This example would match both DFW-FS01 and DFS-PS01. Think of the pipe symbol like an “or” conditional operator.</p>
<p><strong>(?i:[pf]s)</strong> – This is another way to get the same results as the previous example. It produces the same matching results. In this case we know that our file servers will be either FS01 or PS01 so we put the “p” and the “f” in brackets which means match either “p” or “f” immediately followed by “s”.</p>
<p><strong>(?i:[a-z][a-z][a-z]-sql-cl[^c-z])</strong> – We can also match by character ranges and exclude characters as well. The brackets with <strong>a-z</strong> inside mean to match any single character “a” through “z. The caret inside the last bracket negates the match so this would mean match any single character <em>except a character “c” through “z”</em>. This would match something like DFW-SQL-CLA, but not DFW-SQL-CLD.</p>
<p>&nbsp;</p>
<p><u>Number pattern matching</u></p>
<p>Parenthesis, brackets, etc still have the same function with numbers. IP ranges are a good example of common pattern matching in SCOM; some examples are as follows:</p>
<p><strong>^([0-9]{1,3}).([0-9]{1,3}).([0-9]{1,3}).([0-9]{1,3})$ - </strong>While not the best method, if you are not worried about validating that a valid number was entered in any octect, this is a simple match for an IPv4 pattern. Let’s break this down.</p>
<ul>
<li>The caret at the beginning means that this is the start of the string, there should be no characters or digits before this in the match.</li>
<li>([0-9]{1,3}) is a capturing group similar to what we used in the string matching earlier with the parenthesis. The [0-9] means to match any single digit between 0 and 9. The {1,3} means to repeat the match 1 to 3 times. This is how we match one octet regardless of if there are one, two, or three digits.</li>
<li>The . or “backslash dot” is how we match the dot between octects. The “dot” is called a meta-character or special character which is used to match any single character in an expression. Since we want it to actually match the “dot” we use the “backslash” to escape and tell the expression to match the “dot” exactly, not as a meta-character.</li>
<li>We then repeat this pattern again for each octet coming to the $ dollar sign at the end. This simply means that this should be the end of the string and no more characters or digits should come after it. Since we are matching an IP in this example expressly, we don’t expect to see anything afterwards. If you needed to match an IP address as part of a string or sentence where you expect characters after the IP address, simply remove the dollar sign.</li>
</ul>
<p>As I mentioned earlier, this is a quick method to match an IP address; however, it will also match 999.999.999.999 which doesn’t fall into any IPv4 scheme I’ve worked with.</p>
<p>Let’s say we want to match a specific IP address on any particular class B network. The following would meet that criteria: <strong>^(10).([0-9]|[1-9][0-9]|1[0-9][1-9]|2[0-4][0-9]|25[0-5]).(10).(250)</strong>. We already understand the first, third and fourth octet, but what about the second? Let’s split it up between the pipe:</p>
<p>[1-9] – match any digit between zero and nine. This takes care of single digits.</p>
<p>[1-9][0-9]  - match anything between 10 and 99.</p>
<p>1[0-9][1-9] – match anything between 100 and 199.</p>
<p>2[0-4][0-9] – match anything between 200 and 249. This is where we would limit to allowed IPv4 range.</p>
<p>25[0-5] – match anything between 250 and 255.</p>
<p>That’s it. That will cover any number between 1 and 255 in the second octect.</p>
<p>&nbsp;</p>
<p>Another example might be to match anything on the 172.24.x.0 network; but the last octet had to match 224 or 225. This would look something like this:</p>
<p><strong>^(172).(24). ([0-9]|[1-9][0-9]|1[0-9][1-9]|2[0-4][0-9]|25[0-5]).(224|225)$</strong></p>
<p>&nbsp;</p>
<p><u>String and number pattern matching</u></p>
<p>What if we had multiple four node clusters using a naming convention similar to DFW-SQLCL1, DFW-SQLCL2, DFW-SQLCL3, DFW-SQLCL4 and we wanted to group only the first and second nodes from all sites into a group? We would use the following expression:</p>
<p><strong>(?i:[a-z][a-z][a-z]-sqlcl[1|2])</strong> or another way to shorten it would be <strong>(?i:[a-z]{1,3}-sqlcl)[1|2]</strong>.</p>
<p>&nbsp;</p>
<p>It helps to use a regular expression tester when working with these. A couple of good ones are <a href="https://regex101.com">https://regex101.com</a> and <a href="http://regexpal.com">http://regexpal.com</a>. I prefer the first one because there is better explanation of the expression you are building as you build it which helps to understand how the regex works.</p>
