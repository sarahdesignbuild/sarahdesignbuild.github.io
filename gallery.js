function createGalleryTiles(directory, imgList) {
    if (!Array.isArray(imgList) || imgList.length < 1 || typeof imgList[0] !== 'string') {
        console.error('Invalid image list provided to createGalleryTiles.');
        return;
    }
    if (typeof directory !== 'string' || directory.trim() === '') {
        console.error('Invalid directory provided to createGalleryTiles.');
        return;
    }
    function createImage(src) {
        src = `/images/${directory}/${src}`;
        return `<li class="col-xs-6 col-sm-4 col-md-3" data-src="${src}"><a href=""><img class="img-responsive" src="${src}" alt="Gallery Image"></a></li>`;
    }
    imgList.forEach((img) => {
        $('ul#lightgallery').append(createImage(img))
    })
}
