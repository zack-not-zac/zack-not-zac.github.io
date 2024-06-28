---
title: Useful Regex for Threat Hunting & Security Investigation
description: This page contains a collection of useful regex strings I have created or found while investigating incidents & writing detections.
date: 2022-03-20
categories: [Blog Posts]
tags: [tips & tricks,blue team]
---
# Extract Domains From Strings

```
(^https\:\/\/|^http\:\/\/|^)(?<Domain>[\w\.\-]+(?=\/|:|$))
```
- This regex will extract a domain from most URL's (including all sub-domains).

# Extract IP Addresses From Strings
```
(?<IP>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})
```
- This regex will extract an IP address from a string (but does not verify that it is in a valid range).

# Check if a String is Base64 Format
```
(?<IsBase64>^(?:[a-zA-Z0-9+\/]{4})*(?:|(?:[a-zA-Z0-9+\/]{3}=)|(?:[a-zA-Z0-9+\/]{2}==)|(?:[a-zA-Z0-9+\/]{1}===))$)
```
- This regex simply matches a string if it is in valid Base64 Format (does not necessarily mean it is a Base64 string).

I will add more queries to this page as I make them.