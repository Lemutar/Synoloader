let { classes: Cc, interfaces: Ci, utils: Cu } = Components;

if (typeof SL_Download === "undefined") {
    var SL_Download = {};

    Cu.import("resource://SynoLoader/DownloadManager.js", SL_Download);

    (function () {
        this.onaccept = (event) => {
            if (document.getElementById("mode").value === "SynoLoader") {
                this.DownloadManager.transferToNas(dialog.mLauncher.source.spec);
                return dialog.onCancel();
            } else {
                return dialog.onOK();
            }
        };
    }).apply(SL_Download);
}
