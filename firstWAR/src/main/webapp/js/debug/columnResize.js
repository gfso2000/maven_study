Ext.namespace('hpsm');

hpsm.GRID_COLUMNS_WIDTH_RECORD = 'columns_width';

(function () {

  var originalColsWidth;
  var preGridWidth;
  var EDGE_BUFFER = 2;

  hpsm.resetColumnWidth = function (colModel, gridInnerWidth) {
    // apply customized column width from browser storage
    var currentItem = hpsm.ux.GridUtil.getStorageItem();

    initColumnWidthFromDesign(colModel, gridInnerWidth);

    if (currentItem && currentItem[hpsm.GRID_COLUMNS_WIDTH_RECORD]) {
      restoreColumnWidthFromStorage(colModel, currentItem[hpsm.GRID_COLUMNS_WIDTH_RECORD]);
    }

    var grid = hpsm.local.recordsList;
    if(grid){
      originalColsWidth = grid.getColumnModel().getTotalWidth()+ EDGE_BUFFER;
      preGridWidth = grid.getView().getGridInnerWidth(true);
    }
  }

  function restoreColumnWidthFromStorage(colModel, widths) {
    for (var tmpDataIndex in widths) {
      var tmpWidth = widths[tmpDataIndex];
      var colNumber = colModel.findColumnIndex(tmpDataIndex);
      if (colNumber != -1) {
        colModel.setColumnWidth(colNumber, tmpWidth);
        updateColumnPercent(colNumber,tmpWidth);
      }
    }
  }

  function initColumnWidthFromDesign(colModel, gridInnerWidth) {
    fitRecordList(colModel, gridInnerWidth, false);
  }

  function fitRecordList(colModel, gridInnerWidth,forceFit){
    // reset column width from form design
    var totalWidth = 0;
    var totalWidthPercent = 0;
    var originalColsWidth = colModel.getTotalWidth(true);

    for (var i = 0, max = colModel.config.length; i < max; i++) {
      var theColumn = colModel.config[i];

      // for checkbox, the width is fixed.
      if (theColumn.id == 'checker') {
        colModel.setColumnWidth(i, theColumn.width);
        originalColsWidth -= theColumn.width;
        gridInnerWidth -= theColumn.width;
        continue;
      }
      // some form, server doesn't response the widthPercent to client.
      if (!theColumn.widthPercent || theColumn.widthPercent == '' || isNaN(theColumn.widthPercent)) {
        theColumn.widthPercent = 1 / max * 100;
      }

      var newWidth = 0;
      if (i == max - 1) {
        if (totalWidthPercent > 100 && !forceFit) {
          newWidth = Math.round(gridInnerWidth * theColumn.widthPercent / 100);
        } else {
          newWidth = gridInnerWidth - totalWidth - EDGE_BUFFER;
          newWidth = newWidth >0? newWidth: 50;
        }
      } else {
        if (forceFit) {
          newWidth = Math.round(gridInnerWidth * theColumn.width / originalColsWidth);
          totalWidth += newWidth;
        } else {
          newWidth = Math.round(gridInnerWidth * theColumn.widthPercent / 100);
          totalWidth += newWidth;
          totalWidthPercent += Math.round(theColumn.widthPercent);
        }
      }
      colModel.setColumnWidth(i, newWidth);
    }
  }

  hpsm.resizeColumn = function (columnIndex, newSize) {
    saveColumnWidth(this.getColumnModel(), columnIndex, newSize);
    updateColumnPercent(columnIndex, newSize);
    var grid = hpsm.local.recordsList;
    originalColsWidth = grid.getColumnModel().getTotalWidth()+ EDGE_BUFFER;
    grid.getView().refresh(false);
  }

  function updateColumnPercent(columnIndex, newSize) {
    var grid = hpsm.local.recordsList;
    var theColumn = grid.getColumnModel().config[columnIndex];
    var gridWidth = grid.getView().getGridInnerWidth(true);
    theColumn.widthPercent = newSize/gridWidth*100;
  }

  function saveColumnWidth(colModel, columnIndex, newSize) {

    var dataIndex = colModel.getDataIndex(columnIndex);

    var originalStorageItem = hpsm.ux.GridUtil.getStorageItem();

    var storageItem = {};
    if(originalStorageItem){
      Ext.apply(storageItem, originalStorageItem);
    }

    if (!storageItem[hpsm.GRID_COLUMNS_WIDTH_RECORD]) {
      storageItem[hpsm.GRID_COLUMNS_WIDTH_RECORD] = {};
    }
    storageItem[hpsm.GRID_COLUMNS_WIDTH_RECORD][dataIndex] = newSize;

    hpsm.ux.GridUtil.saveStorageItem(storageItem);
  }

  /**
   * resize columns automatically when browser window resizes.
   */
  hpsm.autoResizeColumns = function () {
    var grid = hpsm.local.recordsList;
    var columnModel = grid.getColumnModel();
    var preColsWidth = columnModel.getTotalWidth()+ EDGE_BUFFER;
    var newGridWidth = grid.getView().getGridInnerWidth(true);
    var deltaGridWidth = newGridWidth - preGridWidth;
    preGridWidth = newGridWidth;
    var newColsWidth = preColsWidth;

    //expand
    if (deltaGridWidth > 0){
      if (newGridWidth > preColsWidth){
        newColsWidth = newGridWidth;
      }
    }
    //shrink
    else if (deltaGridWidth < 0){
      //do nothing
      if (newGridWidth >= preColsWidth){
      } else if (newGridWidth >= originalColsWidth) {
        newColsWidth = newGridWidth;
      } else {
        newColsWidth = originalColsWidth;
      }
    }
    if (newColsWidth != preColsWidth){
      fitRecordList(columnModel, newColsWidth, true);
      grid.getView().refresh(false);
    }
  }

})();