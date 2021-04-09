# JS IMAGE CARVER

Content-aware image resizer

- ▶️ [️Demo](https://trekhleb.dev/js-image-carver)
- ✏️ [How it works](https://trekhleb.dev/blog/2021/content-aware-image-resizing-in-javascript/)
- 📄 [Seam carving paper](https://perso.crans.org/frenoy/matlab2012/seamcarving.pdf)

![JS IMAGE CARVER](public/site-meta-image.png)

### Content-aware image resizing

![Content-aware image resizing](public/demo-00-02.png)

The idea behind the [Seam Carving algorithm](https://perso.crans.org/frenoy/matlab2012/seamcarving.pdf) is to find the *seam* (continuous sequence of the pixels) with the lowest contribution to the image content and then *carve* (remove) it. This process repeats over and over again until we get the required image width or height. In the example below you may see that the hot air balloon pixels contributes more to the content of the image than the sky pixels. Thus, the sky pixels are being removed first. 

![JS IMAGE CARVER DEMO](public/demo-01.gif)

> Btw, finding the seam with the lowest energy is pretty computationally expensive task (especially for large images). To make the seam search faster the dynamic programming approach [might be applied](https://trekhleb.dev/blog/2021/content-aware-image-resizing-in-javascript/).

### Objects removal

The importance of each pixel (its so-called energy) is being calculated based on its color (`R`, `G`, `B`) difference between two neighbor pixels. More detailed explanation with examples you may find in my [Content-aware image resizing in JavaScript](https://trekhleb.dev/blog/2021/content-aware-image-resizing-in-javascript/) blog post. Now, if we set the pixel energy to some really low level artificially (i.e. by drawing a mask on top of them), the Seam Carving algorithm would perform an **object removal** for us for free.

![JS IMAGE CARVER OBJECT REMOVAL DEMO](public/demo-02.gif)

You may [launch the JS IMAGE CARVER](https://trekhleb.dev/js-image-carver) and play around with resizing of your custom images.

## Features

- [x] Downscaling of the images without distorting their content-intensive parts
- [x] Objects removal during resizing

## Plans

- [ ] Image upscaling
- [ ] Upscale the image to its original size after objects removal  
- [ ] Real-time resizing
