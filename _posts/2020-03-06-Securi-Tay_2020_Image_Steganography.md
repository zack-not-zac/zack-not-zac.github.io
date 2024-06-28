---
title: Creating an Image Steganography & Network Forensics CTF Challenge 
description: For Securi-Tay 2020 the committee decided to host a penguin-themed CTF featuring challenges made by current and former students. I decided to create an easily accessible challenge, allowing people to get to grips with the CTF format using a relatively simple challenge. This challenge featured a combination of simple network forensics and image steganography.
date: 2020-03-06
categories: [Blog Posts]
tags: [ctf,hacking,guide]
---
If you'd like to give it a go all you have to do is download [this PCAP file]({{site.url}}/assets/Securi-Tay-Challenge.pcapng) to get started.

### Creating the Challenge

Firstly, I gathered a few images of the penguin statues around Dundee and Tux the penguin, the official mascot of the Linux Kernel. I then stripped all the metadata from these images to avoid any confusion in challenges, which can be done using exiftool.

```bash
exiftool ./*.png -all=
```

The flag was then created by encoding a phrase in MD5 and adding the MD5 hash into the standard flag format of the challenge. This flag was then reversed and encoded in Base64 using [CyberChef](https://gchq.github.io/CyberChef/) before being split into 3 parts, one for each image.

The first part was hidden in the exif data of the first image. The "exif" tool included with Kali only supports JPEG exif data and as such the first image was converted to a JPEG to ensure the flag was not accidentally missed by those using this tool.

```bash
exif --tag="Software" --set-value="Flag Pt.1: " --ifd=0 1.jpeg
```

The next image was designed to be slightly more challenging using Least Significant Bit (LSB) steganography. This method of steganography encodes a message in the image by changing the least significant bit of each pixel. This results in a slight colour change which is difficult to detect by the human eye, even with a side-by-side comparison between the original image and the version hiding the encoded message. To do this I used a Python library called "stegano", which allowed me to easily encode a message in the image using the simple Python script below.

```python
#!/usr/bin/env python3

from PIL import Image
from stegano import lsb
import sys
 
def save_image(image):
    image.save("2.png","PNG")

def encode_image(image,msg):
    temp = lsb.hide(image, msg)
    save_image(temp)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: " + sys.argv[0] + "[filename] [message]")
        exit()
    
    try:
        image = Image.open(sys.argv[1])
    except:
        print("Unable to open file")
        exit()

    encode_image(image,sys.argv[2])
```

To ensure people didn't miss this, I hid a message at the end of the file which could be found using a tool such as "strings".

```bash
echo "Close... but no. Hint: 'stegano'" >> 2.png
```

With this hint, solving the challenge was a case of searching for "stegano", downloading the library, and using the [documentation](https://pypi.org/project/stegano/) to utilise the "lsb.reveal()" function.

```python
from stegano import lsb

print(lsb.reveal('./2.png'))
```

For the third part of the challenge, the final part of the flag was hidden in a .docx file, which was then added to a zip archive and appended to the image. It is important to use a .docx file instead of a .txt file as .txt files are uncompressed, meaning someone could find the final part of the flag using the "strings" tool on the zip archive used to store the .docx file. This zip file could be recovered from the image using a binary analysis tool such as binwalk or foremost.

```bash
zip 3.zip 3.docx
cat 3.png 3.zip > 3_hidden.png
rm 3.png && mv 3_hidden.png 3.png
```

All 3 image files where then added to a zip archive and hosted on a web server using Python's SimpleHTTPServer library. Finally, the network traffic generated by someone downloading the file was then captured and saved to generate the PCAP file. Since the traffic was unencrypted, this made it easy for someone to extract the zip file using a tool such as Wireshark by exporting all HTTP objects from the capture.

### Conclusion

So that's it! If you've never tried making a CTF challenge before, these challenges are usually easy to make and relatively easy to solve. You could also go further with image steganography, hiding a message in certain colour layers, or even [using audio and video files](https://www.tech2hack.com/steganography-hide-data-in-audio-video-image-files/).

Check out [this page](https://ctfs.github.io/resources/topics/steganography/invisible-text/README.html) for some more basic CTF challenges and ideas, and even try more CTF challenges on services such as <https://tryhackme.com/> or <https://www.hackthebox.eu/>.