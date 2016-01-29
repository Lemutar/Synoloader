let {
    utils: Cu
} = Components;

Cu.import("resource://SynoLoader/DownloadManager.js");

if (typeof SL_Download === "undefined") {
    var SL_Download = {};

    (function() {
        this.onaccept = (event) => {
            if (document.getElementById("mode").value === "SynoLoader") {
                let linkURL = dialog.mLauncher.source.spec;
                DownloadManager.connectAndRun(() => {
                    DownloadManager.transferToNas(linkURL);
                });
                return dialog.onCancel();
            } else {
                return dialog.onOK();
            }
        };
    }).apply(SL_Download);
}
