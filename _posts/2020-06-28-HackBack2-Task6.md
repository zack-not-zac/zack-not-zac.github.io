---
title: HackBack2 Task 6 - Checks Walkthrough
description: This challenge is from the Hackback2 CTF.
date: 2020-06-28
categories: [Blog Posts]
tags: [ctf,hacking,guide]
---
This challenge is from the [Hackback2 CTF](https://tryhackme.com/room/hackback2), on which I have been spending my spare time re-visiting some challenges. My team managed to finished [7th overall](https://pbs.twimg.com/media/EH0Ag4kXYAoIg4i?format=png&name=medium) as "TheATeam". For this walkthrough I am going to be using Ghidra, an incredibly useful reverse engineering tool which you can download from [here.](https://ghidra-sre.org/)

### Reverse Engineering
The first step once we have the executable is to run it and see what it does. In this case, it simply outputs _'hm you need to do more to get the flag'_. Not a lot of useful information.

Lets load it up in Ghidra by creating a new project then dragging the executable into the landing window, or by pressing 'I' and opening it using the file browser, clicking OK on the dialog to accept the default settings. You'll then be presented with some information on the executable, as seen below. Sometimes this information can be very useful, however in this case it all seems normal.

![Ghidra Information]({{site.url}}/assets/img/hackback2-task6-ghidra-info.png "Ghidra Info")

Next, load up the executable in the code browser (by dragging it over the dragon icon) and allow it to fully analyse the file using the suggested settings. Find the Symbol Tree (usually on the left side) and use the filter options to find the 'main' function.

![Ghidra Symbol Tree]({{site.url}}/assets/img/hackback2-task6-symbol-tree.png "Ghidra Symbol Tree")

Clicking the function will then display the decompiled code in C, which at first can seem a bit daunting. However, reading through the code and searching for information on system functions called by the executable will help to work through the problem and understand the program. The first variable is set to the return value of getuid(), which a quick search tells us that this ["returns the real user id of the calling process"](https://linux.die.net/man/2/getuid). Next up is getpwuid(), which ["returns a pointer to a structure containing the broken-out fields of the record in the password database (e.g., the local password file /etc/passwd)"](https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.3.0/com.ibm.zos.v2r3.bpxbd00/rtgtpu.htm). The getenv() call returns the value of a specified environment variable, in this case, "SECRET_REQ". It can be useful to rename these variables to make the code more readable by right-clicking them, as I have below

```c
pw = getpwuid(__uid);
envvar = getenv("SECRET_REQ");
ret = thunk_FUN_004004ee(&DAT_0049e824,pw->pw_name)
```

The program then goes on to call a function which Ghidra does not recognise, however, if we look at later lines we can see that this function is comparing the 'envvar' variable, as renamed above, to the string "coolenvvar". Using this, we can guess that this function is likely the same or similar to the [strcmp() function](https://www.programiz.com/c-programming/library-function/string.h/strcmp). We can make the code far more readable by redefining the function using the "Edit Function Signature" in the right-click menu and using the prototype of the strcmp() function.

```c
int strcmp (char* str1, char* str2)
```

Doing this makes the code far more readable, and we can now see that firstly, the program checks if the username is "800", then checks if the environment variable "SECRET_REQ" is equal to "coolenvvar". If both these checks pass, it attempts to access the file "secrets.zip". If it cannot find the file, it calls another function.

```c
pw = getpwuid(__uid);
envvar = getenv("SECRET_REQ");
ret = strcmp("800",pw->pw_name);
if (ret == 0) {
    if (envvar != (char *)0x0) {
    ret = strcmp(envvar,"coolenvvar");
        if (ret == 0) {
            ret = access("secrets.zip",0);
            if (ret != -1) {
                asvv889a();
            }
        }
    }
}
else {
    printf("hm you need to do more to get the flag");
}
```

Lets investigate the function "asvv889a()" by double clicking on it. Here we can see a printf() statement to print the flag, as well as a couple of variables.

![Ghidra Flag]({{site.url}}/assets/img/hackback2-task6-flag.png "Ghidra Flag")

We can see that uVar1 is set to the return value of "local18" when passed through the strtol() command, [which converts the initial part of a string to a long variable type](https://www.tutorialspoint.com/c_standard_library/c_function_strtol.htm). This means that "local18" must be a string, and a brief look at the value and you can probably guess that it is in hexidecimal format. We can format this into text using [CyberChef](https://gchq.github.io/CyberChef/) using the "From Hex" operation and then reversing the string. After that, we have our flag!