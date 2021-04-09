# JS IMAGE CARVER

Content-aware image resizer

- ▶️ [️Demo](https://trekhleb.dev/js-image-carver)
- ✏️ [How it works](https://trekhleb.dev/blog/2021/content-aware-image-resizing-in-javascript/)
- 📄 [Seam carving paper](https://perso.crans.org/frenoy/matlab2012/seamcarving.pdf)

![JS IMAGE CARVER](public/site-meta-image.png)

The idea behind the _Seam Carving algorithm_ is to find the seam (continuous sequence of the pixels) with the lowest contribution to the image content and then remove it. This process repeats over and over again until we get the required image width or height. In the example below you may see that the hot air balloon pixels contributes more to the content of the image than the sky pixels. Thus, the sky pixels are getting removed first. 

![JS IMAGE CARVER DEMO](public/demo-01.gif)

## Features

- [x] Downscaling of the images without distorting their content-intensive parts
- [x] Objects removal during resizing

## Plans

- [ ] Image upscaling
- [ ] Upscale the image to its original size after objects removal  
- [ ] Real-time resizing
