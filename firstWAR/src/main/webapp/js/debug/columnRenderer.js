Ext.namespace('hpsm');
hpsm.JSON_TAG_IMG = '___img:';
hpsm.BASE_IMAGES_PATH = 'images/obj16/';

(function () {

  hpsm.initColumnRenderer = function (colModel) {
    for (var i = 0, max = colModel.config.length; i < max; i++) {
      var theColumn = colModel.config[i];
      if(theColumn.id != 'checker'){
        colModel.setRenderer(i, hpsm._renderColumn);
      }
    }
  };

  /**
   * @private
   * Render recordlist column.
   */
  hpsm._renderColumn = function (val) {

    // display icon in cell
    if (val && typeof(val) == 'string') {
      var index = val.indexOf(hpsm.JSON_TAG_IMG);
      if (index != -1) {
        val = val.substring(hpsm.JSON_TAG_IMG.length);
        if (val.indexOf('.gif') == -1) {
          val = val + '.gif';
        }
        var imgPath = hpsm.BASE_IMAGES_PATH + val;
        val = '<img src=' + imgPath + '>';
      }
    }

    // first column (except checker) can be drilled down.
    if (listConfig.displayMode == 'list' && this.isFirstColumn == 'true') {
      if (!val || val.trim() == "") {
        return '<a tabIndex="-1" onclick="return false;" href="javascript:void(0);">' + hpsm.l10n.reclist.column_detail + '</a>';
      } else {
        return '<a tabIndex="-1" onclick="return false;" href="javascript:void(0);">' + val + '</a>';
      }
    }


    return val;
  }

})();