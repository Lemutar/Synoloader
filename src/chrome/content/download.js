const { classes: Cc, interfaces: Ci } = Components;

if (typeof SynoLoader === 'undefined') {
    var SynoLoader = {};

    Components.utils.import('resource://SynoLoader/DownloadManager.js', SynoLoader);

    (function () {
        this.onaccept = function (event) {
            if (document.getElementById('mode').value === 'SynoLoader') {
                SynoLoader.SynoLoader_DownloadManager.transfer_to_nas(dialog.mLauncher.source.spec);
                return dialog.onCancel();
            } else {
                return dialog.onOK();
            }
        };
    }).apply(SynoLoader);
}
