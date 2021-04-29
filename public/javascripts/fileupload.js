
FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
)

FilePonde.setOptions({
    stylePanelAspectRatio: 150 / 100    
})

FilePond.parse(document.body);