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

A few examples of using regular expressions in group targeting in SCOM.
<u>String pattern matching</u>
**(?i:fs)** – This simple pattern will match “fs” in any string and is case-insensitive. For example, DFW-FS01 would match. The parenthesis and question mark stipulate a non-capturing group. A capture group stores regex matches for use later in the expression. Since we don’t need to do anything with the match, the non-capturing group makes more sense and is optimized for this case. The **i:** after the question mark is a modifier that stipulates a case-insensitive match. This would effectively match **fs, Fs, fS, FS**.
**(?i:fs|ps)** – This expands on the previous example to match alternatives in the non-capturing group. Let’s say we wanted to add both file servers and print servers into a group expression. This example would match both DFW-FS01 and DFS-PS01. Think of the pipe symbol like an “or” conditional operator.
**(?i:\[pf\]s)** – This is another way to get the same results as the previous example. It produces the same matching results. In this case we know that our file servers will be either FS01 or PS01 so we put the “p” and the “f” in brackets which means match either “p” or “f” immediately followed by “s”.
**(?i:\[a-z\]\[a-z\]\[a-z\]-sql-cl\[\^c-z\])** – We can also match by character ranges and exclude characters as well. The brackets with **a-z** inside mean to match any single character “a” through “z. The caret inside the last bracket negates the match so this would mean match any single character *except a character “c” through “z”*. This would match something like DFW-SQL-CLA, but not DFW-SQL-CLD.

<u>Number pattern matching</u>
Parenthesis, brackets, etc still have the same function with numbers. IP ranges are a good example of common pattern matching in SCOM; some examples are as follows:
**^(\[0-9\]{1,3}).(\[0-9\]{1,3}).(\[0-9\]{1,3}).(\[0-9\]{1,3})$ - **While not the best method, if you are not worried about validating that a valid number was entered in any octect, this is a simple match for an IPv4 pattern. Let’s break this down.


1. The caret at the beginning means that this is the start of the string, there should be no characters or digits before this in the match.
2. (\[0-9\]{1,3}) is a capturing group similar to what we used in the string matching earlier with the parenthesis. The \[0-9\] means to match any single digit between 0 and 9. The {1,3} means to repeat the match 1 to 3 times. This is how we match one octet regardless of if there are one, two, or three digits.
3. The . or “backslash dot” is how we match the dot between octects. The “dot” is called a meta-character or special character which is used to match any single character in an expression. Since we want it to actually match the “dot” we use the “backslash” to escape and tell the expression to match the “dot” exactly, not as a meta-character.
4. We then repeat this pattern again for each octet coming to the $ dollar sign at the end. This simply means that this should be the end of the string and no more characters or digits should come after it. Since we are matching an IP in this example expressly, we don’t expect to see anything afterwards. If you needed to match an IP address as part of a string or sentence where you expect characters after the IP address, simply remove the dollar sign.


As I mentioned earlier, this is a quick method to match an IP address; however, it will also match 999.999.999.999 which doesn’t fall into any IPv4 scheme I’ve worked with.
Let’s say we want to match a specific IP address on any particular class B network. The following would meet that criteria: **^(10).(\[0-9\]|\[1-9\]\[0-9\]|1\[0-9\]\[1-9\]|2\[0-4\]\[0-9\]|25\[0-5\]).(10).(250)**. We already understand the first, third and fourth octet, but what about the second? Let’s split it up between the pipe:
\[1-9\] – match any digit between zero and nine. This takes care of single digits.
\[1-9\]\[0-9\]  - match anything between 10 and 99.
1\[0-9\]\[1-9\] – match anything between 100 and 199.
2\[0-4\]\[0-9\] – match anything between 200 and 249. This is where we would limit to allowed IPv4 range.
25\[0-5\] – match anything between 250 and 255.
That’s it. That will cover any number between 1 and 255 in the second octect.

Another example might be to match anything on the 172.24.x.0 network; but the last octet had to match 224 or 225. This would look something like this:
**^(172).(24). (\[0-9\]|\[1-9\]\[0-9\]|1\[0-9\]\[1-9\]|2\[0-4\]\[0-9\]|25\[0-5\]).(224|225)$**

<u>String and number pattern matching</u>
What if we had multiple four node clusters using a naming convention similar to DFW-SQLCL1, DFW-SQLCL2, DFW-SQLCL3, DFW-SQLCL4 and we wanted to group only the first and second nodes from all sites into a group? We would use the following expression:
**(?i:\[a-z\]\[a-z\]\[a-z\]-sqlcl\[1|2\])** or another way to shorten it would be **(?i:\[a-z\]{1,3}-sqlcl)\[1|2\]**.

It helps to use a regular expression tester when working with these. A couple of good ones are <a href="https://regex101.com">https://regex101.com</a>