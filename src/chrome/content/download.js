const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

if (SL_Download === void(0)) {
    let SL_Download = {};

    Cu.import("resource://SynoLoader/DownloadManager.js", SL_Download);

    (function () {
        this.onaccept = function (event) {
            if (document.getElementById("mode").value === "SynoLoader") {
                this.SL_DownloadManager.transfer_to_nas(dialog.mLauncher.source.spec);
                return dialog.onCancel();
            } else {
                return dialog.onOK();
            }
        };
    }).apply(SL_Download);
}
