/***************************************************************************
* attachments.js
*---------------------------------------------------------------------------
* (c) Hewlett-Packard Development Company, L.P. 1994-2006
* Language    : Javascript
* Creation    : Magaly Drant
****************************************************************************
* Handle attached files operations
****************************************************************************/
function openAttachment(name, id, type, len)
{
  var currentThreadId = cwc.getValueFromCurrentTab('threadId');
  window.open("detail.do?ctx=attachment&action=open&name=" + encodeURIComponent(name) + "&id=" + id + "&type=" + type + "&len=" + len + "&thread=" + currentThreadId, "openAttachment");
}

function openAddedAttachment(filepath)
{
  window.open("detail.do?ctx=attachment&action=openadded&filepath=" + encodeURIComponent(filepath), "openAttachment");
}

function selectAttachment(div)
{
  var hidden = document.getElementById("hidden_attachments_div")
  if (!hidden)
  {
    hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.id = "hidden_attachments_div";
    hidden.name = "hidden_attachments_div";
    document.forms[scFromDefault].appendChild(hidden);
  }
  hidden.value = div;
  
  window.open("selectFile.jsp?action=attachmentupload","AttachmentSelector","height=100, width=400");
}

function deleteRow(obj)
{
  if(document.getElementById(obj))
    document.getElementById(obj).style.display = "none";
}

function onDeleteAttachment(obj)
{
  var id = obj.substring(4);
  var hidden = document.getElementById("hidden_" + obj);
  var len = parseInt(document.getElementById("len_" + id).value);
  var type = document.getElementById("type_" + id);
  var file = document.getElementById("file_" + id);
  if( type != null )
  {
    // this is not a newly added attachment
    hidden.value = id + "?" + len + "?" + type.value + "?" + file.value;
  }
  else
    hidden.value = obj;

  setAttachmentListSize(getAttachmentListSize()-len);
  lockForm();
}

function onCancelUpload()
{
  window.close();
}

function onAttachmentUploaded(uniqueId, filepath, len)
{
  if(filepath != null && filepath != "")
  {
    // update the opener window
    window.opener.createAttachment(uniqueId, filepath, parseInt(len));
    var div = window.opener.document.forms["topaz"].hidden_attachments_div.value;
    window.opener.document.getElementById(div + "attachments_scroll").style.display = "inline";
    if(window.opener.document.getElementById("xxx"))
      window.opener.document.getElementById("xxx").value = window.opener.document.getElementById(div + "attachement_cont").innerHTML;
  }
  window.close();
}

function createAttachment(uniqueId, filepath, len)
{
  if(checkSize(len) == false)
    return;

  lockForm();

  var list = getAttachmentList();
  var body = list.tBodies[0];
  var newRow = body.insertRow(-1);
  var cssName = "TableOddRow";
  if(list.length%2)
    cssName = "TableEvenRow";
  newRow.className = cssName;
  newRow.id = uniqueId;

  var cell0 = newRow.insertCell(-1);
  // FILENAME and internal storage hidden fields
  var hidden0 = document.createElement("input");
  hidden0.type = "hidden";
  hidden0.id = "hidden_del_new_" + uniqueId;
  hidden0.name = "attachmentsDeleted/attachment_" + uniqueId;
  cell0.appendChild(hidden0);

  var hidden1 = document.createElement("input");
  hidden1.type = "hidden";
  hidden1.id = "hidden_new_" + uniqueId;
  hidden1.name = "attachmentsAdded/attachment_" + uniqueId;
  hidden1.value = uniqueId + "?" + filepath;
  cell0.appendChild(hidden1);

  var hidden2 = document.createElement("input");
  hidden2.type = "hidden";
  hidden2.id = "len_new_" + uniqueId;
  hidden2.name = "len_new_" + uniqueId;
  hidden2.value = len;
  cell0.appendChild(hidden2);

  var anchor0 = document.createElement("a");
  var span0 = document.createElement("span");
  var lastSep = Math.max(filepath.lastIndexOf("/"), filepath.lastIndexOf("\\"));
  var filename = filepath.substring(lastSep+1);
  var view508 = (window.opener && window.opener.viewAttachment508)?window.opener.viewAttachment508:self.viewAttachment508;
  if (!isIE)
  {
    // IE already URL-encodes when you assign the anchor.href
    filepath = encodeURIComponent(filepath);
  }
  anchor0.href = "javascript:openAddedAttachment('" + filepath.replace(/\'/gi, "\\'") + "')";
  anchor0.title = view508;
  span0.innerHTML = filename;
  anchor0.appendChild(span0);
  cell0.appendChild(anchor0);


  // file size column
  var cell1 = newRow.insertCell(-1);
  var fileSize = len + " bytes";
  cell1.innerHTML = fileSize;

  // remove attachment column
  var cell3 = newRow.insertCell(-1);
  cell3.className = "ColRemove";
  var hidden3 = document.createElement("input");
  hidden3.type = "hidden";
  hidden3.id = "del_new_" + uniqueId;
  hidden3.name = "len_new_" + uniqueId;
  hidden3.value = "true";
  cell3.appendChild(hidden3);

  var anchor3 = document.createElement("a");
  var remove508 = (window.opener && window.opener.removeAttachment508)?window.opener.removeAttachment508:self.removeAttachment508;
  anchor3.href = "javascript:deleteRow('"+ uniqueId +"');onDeleteAttachment('del_new_" + uniqueId +"')";
  anchor3.title = remove508;

  var span3 = document.createElement("span");
  var removeAtt = (window.opener && window.opener.removeAttachment)?window.opener.removeAttachment:self.removeAttachment;
  span3.innerHTML = removeAtt;
  anchor3.appendChild(span3);

  cell3.appendChild(anchor3);

}

function getDate()
{
  var dToday = new Date();
  return dToday.getMonth()+1+"/"+dToday.getDate()+"/"+dToday.getFullYear();
}

function getAttachmentList()
{
  var div = document.forms[scFromDefault].hidden_attachments_div.value;
  return document.getElementById(div + "attachments_list");
}

function getMaxAttachSize()
{
  var list = getAttachmentList();
  return parseInt(list.getAttribute("maxAttachSize"));
}

function setMaxAttachSize(iValue)
{
  var list = getAttachmentList();
  list.setAttribute("maxAttachSize",iValue);
}

function getTotalAttachSize()
{
  var list = getAttachmentList();
  return parseInt(list.getAttribute("totalAttachSize"));
}

function setTotalAttachSize(iValue)
{
  var list = getAttachmentList();
  return list.setAttribute("totalAttachSize",iValue);
}

function getAttachmentListSize()
{
  var list = getAttachmentList();
  return parseInt(list.getAttribute("size"));
}

function setAttachmentListSize(iValue)
{
  var list = getAttachmentList();
  return list.setAttribute("size",iValue);
}

function checkSize(size)
{
  var totalSize = getAttachmentListSize() + size;
  var maxAttachSize = getMaxAttachSize();
  if(maxAttachSize <= 0)
    maxAttachSize = size;
  var maxTotalAttachSize = getTotalAttachSize();
  if(maxTotalAttachSize <= 0)
    maxTotalAttachSize = totalSize;

  if (size > maxAttachSize)
  {
    alert(maxAttachSizeExceedMsg);
    return false;
  }
  else if (totalSize > maxTotalAttachSize)
  {
    alert(totalAttachmentSizeExceedMsg);
    return false;
  }
  else
  {
    setAttachmentListSize(totalSize);
    return true;
  }
}

//DVD
function dvdUpdateMaxAttachSize(field,sValue)
{
  iValue = parseInt(sValue);
  if(isNaN(iValue))
    return;
  setMaxAttachSize(iValue);
}

function dvdUpdateTotalAttachSize(field,sValue)
{
  iValue = parseInt(sValue);
  if(isNaN(iValue))
    return;
  setTotalAttachSize(iValue);
}

// The following methods handle the case when only one file can be attached to the record
var prefix = "FileSelector_";

function chooseUnique(fieldId)
{
  // open file selector
  window.open("selectFile.jsp?action=uniqueupload", prefix + fieldId, "height=100, width=400");
}

function privRemoveUnique(fieldId)
{
  // is there a saved attachment to remove?
  var hidden1 = document.getElementById(fieldId + "Deleted");
  var hidden2 = document.getElementById(fieldId + "DeletedValue");
  if (hidden1 && hidden2)
    hidden1.value = hidden2.value;
  
  // is there an unsaved attachment to remove?
  var hidden3 = document.getElementById(fieldId + "Added");
  if (hidden3)
    hidden3.value = "none_added";
}

function removeUnique(fieldId)
{
  privRemoveUnique(fieldId);

  // update display
  var fileLink = document.getElementById(fieldId + "Properties");
  fileLink.innerHTML = "";
  fileLink.style.display = "none";
   var buttonAdd = document.getElementById(fieldId + "Add");
  buttonAdd.disabled = false;
  var buttonRemove = document.getElementById(fieldId + "Remove");
  buttonRemove.disabled = true; 
}

function onUniqueUploaded(uid, path, name, len)
{
  var fieldId = window.name.substring(prefix.length);
  window.opener.updateUnique(fieldId, uid, path, name, len);
  window.close();
}

function updateUnique(fieldId, uid, path, name, len)
{
  privRemoveUnique(fieldId);
  
  // provide handle to the newly uploaded file
  var hidden = document.getElementById(fieldId + "Added");
  if (hidden)
    hidden.value = uid + "?" + path;
  
  // update display
  var fileLink = document.getElementById(fieldId + "Properties");
  if (!isIE)
  {
    // IE already URL-encodes when you assign the anchor.href
    path = encodeURIComponent(path);
  }
  fileLink.href = "javascript:openAddedAttachment('" + path.replace(/\'/gi, "\\'") + "')";
  fileLink.innerHTML = name + " (" + len + " bytes)";
  fileLink.style.display = "inline";
  var buttonAdd = document.getElementById(fieldId + "Add");
  buttonAdd.disabled = true;
  var buttonRemove = document.getElementById(fieldId + "Remove");
  buttonRemove.disabled = false;
}

/*
 * Collapsible sections.
 */
hpsm.clpsSections = function() {
  //This variable stores the default expand status. 
  var initialSectionStatus = {};

  // Get the lowest position offset of any child element of a collapsible section.
  // It is NOT sufficient to get the last child to base the size on, because
  // a child in the middle of the pack could have a much larger height than any other.
  function calcContainerHeight(elem) {
    var children = elem.children;
    var maxHeight = 0;
    for (var i=0, maxi=children.length; i<maxi; i++) {
      var c = children[i];
      var offset = 0;
      var posStyle = tpzGetStyle(c, "position");
      //Recursively calculate child elements if not "abosolute"/"relative"
      if (posStyle != "absolute" && posStyle != "relative") {
        offset = calcContainerHeight(c);
      }
      else if (c.offsetTop || c.offsetHeight){
        offset = c.offsetTop + c.offsetHeight;
      }
      if (offset > maxHeight) {
        maxHeight = offset;
      }
    }
    return maxHeight;
  }
  
  /**
   * collapse a section
   */
  function collapse(section) {
    cwc.removeStyleClass(section.btn.firstChild, 'toggleClose');
    section.btn.setAttribute('alt', section.btn.getAttribute('expandhint'));
    section.btn.setAttribute('title', section.btn.getAttribute('expandhint'));
    cwc.addStyleClass(section.fieldset, "cntHidden");

    section.panel.style.height = '24px';
    resizeParent(section);
    repositionMsgboxForIE();
  }

  /**
   * reposition the message box for IE due to QCCR1E72390.
   */
  function repositionMsgboxForIE(){
    if(!top.cwc.isIE){
      return;
    }
    var targetDoc = (top.cwc.isListDetail()) ? top.cwc.getDetailFrameDocument() : top.cwc.getCenterFrameDoc();
    var mb = targetDoc.msgBox;
    if (mb && mb.getY() != mb.yOffset) {
      targetDoc.msgBox.setY(mb.yOffset,false);
    }
  }

  /**
   * expand a section
   */
  function expand(section) {
    cwc.addStyleClass(section.btn.firstChild, 'toggleClose');
    section.btn.setAttribute('alt', section.btn.getAttribute('collapsehint'));
    section.btn.setAttribute('title', section.btn.getAttribute('collapsehint'));
    cwc.removeStyleClass(section.fieldset, "cntHidden");
    //For IE, set section with "display=block" to make sure all content can be displayed under IE7 doc mode
    if(cwc.getTopCwc().isIE) {
      section.fieldset.style.display = "block";
    }
    // Check for an embeddedViewer and do lazy load it if needed.
    hpsm.lazyloadViewer(section.fieldset);
    restoreSectionHeight(section);
    resizeParent(section);
    //pending expand children
    if (section.lazyExpSecs) {
      for (var i = 0; i < section.lazyExpSecs.length; i++) {
        expand(section.lazyExpSecs[i]);
      }
      delete section.lazyExpSecs;
    }
  }

  /**
   * Get a section object by ID
   * a section object is attached to a panel DIV element
   */
  function getSection(cntId) {
    var panelElement = document.getElementById(cntId);
    if (panelElement.section != null) {
      return panelElement.section;
    } 
    else {
      var fieldsetElement = document.getElementById(cntId+'Container');
      var dftHeight;
      if (fieldsetElement != null) {
        dftHeight = fieldsetElement.getAttribute("default-height") || 0;
      }
      var section = {
        panel: panelElement, //the outside DIV with class "sm-clpsSection"
        fieldset: fieldsetElement, //the content DIV with class "sm-clpsSectionCnt"
        btn: document.getElementById(cntId+'Toggle'),  //the +/- button to toggle expand/collapse
        defaultHeight:  parseInt(dftHeight), //the default height set by form definition.
        isExpanded : function() { 
          return !hasStyleClass(this.fieldset, "cntHidden");
        },
        /**
         * Fetch the parent section if exists. 
         */
        getParentSection : function(){ 
          if (this.parentSection == undefined) { 
            var pSectionNode = fetchParentSection(section.panel);
            if (pSectionNode == null) {
              return null;
            }
            this.parentSection = getSection(pSectionNode.id);
          }
          return this.parentSection;
        },
        /**
         * Child sections that need to expand after this section expanded.
         */
        addPendingExpandChild : function(section) {
          if (this.lazyExpSecs == undefined) {
            this.lazyExpSecs = [];
          }
          this.lazyExpSecs.push(section);
        }
      };
      panelElement.section = section;
      return section;
    }
  }
  
  /**
   * try to found parent section by panel element
   */
  function fetchParentSection(elem) {
    var parentNode = elem.parentNode;
    if (parentNode == null) {
      return null;
    }
    if (parentNode.className == 'sm-clpsSection') {
      return parentNode;
    }
    return fetchParentSection(parentNode);
  }

  
  function hasStyleClass(elem, cls) {
    var arr = elem.className.split(' ');
    for (var i=arr.length ; i > 0 ; ) {
      if (arr[--i]==cls)
        return true;
    }
    return false;
  }

  /**
   * Toggles styling of collapsible section to expand/collapse.
   */
  function toggleSize(cntId) {
    var section = getSection(cntId);
    if (section.isExpanded()) {
      collapse(section);
    } else {
      expand(section);
    }
    groupStateCache.saveState(cntId, section.isExpanded());
  }

  /**
   * recursive to find and resize parent sections
   * when a child section expand/collapse, all its parent sections' height will be recalculated
   */
  function resizeParent(section) {
    //Do nothing in preview mode.
    if (isPreview) return;
    var parentSection = section.getParentSection();
    if (parentSection == null) {
      return;
    }
    restoreSectionHeight(parentSection, true);
    resizeParent(parentSection);
  }
    
  /**
   * restore the height of a section
   * @param reset
   *         reset to recalculate the section's height
   */
  function restoreSectionHeight(section, reset) {
    if (section.isExpanded()) {
      var height;
      //preview mode, always uses its default height.
      if (isPreview) {
        height = section.defaultHeight;
      }
      //calculate new height.
      else if (reset || section.contentHeight == undefined) {
        height = getExpandedHeight(section);
      }
      //use remembered height.
      else {
        height = section.contentHeight;
      }

      var oldFieldsetHeight = section.fieldset.style.height;
      var oldPanelHeight = section.panel.style.height;

      oldFieldsetHeight = parseInt(oldFieldsetHeight)
      oldPanelHeight = parseInt(oldPanelHeight)

      if ((isNaN(oldFieldsetHeight)) || (height > oldFieldsetHeight))
      {
        section.fieldset.style.height = height + 'px'; // restore height
      }
      if ((isNaN(oldPanelHeight)) || ((height + 15) > oldPanelHeight))
      {
        section.panel.style.height = (height + 15) + 'px'; // restore height + padding
      }
    }
  }
  
  /**
   * Get the proper height of a section. 
   * It trys to calculate the height, and if get a 0 result, uses section's defaultHeight as the height value.
   */
  function getExpandedHeight(section){
    var height = calcContainerHeight(section.fieldset);
    //Get 0 height value. Maybe not get proper offsetHeight value.
    if (height == 0) {
      height = section.defaultHeight;
    } else {
      section.contentHeight = height; 
      height += 20;//add space after calculate;
    }
    return height;
  }
  
  var groupStatusCacheKey = "groupCache";
  /**
   * caching whether a group is currently open or closed
   * The collapse status in a tab is remembered by the form name.
   */ 
  var groupStateCache = {
    getCachedObj: function() {
      var cachedObj = cwc.getValueFromCurrentTab(groupStatusCacheKey);
      if (!cachedObj) {
        cachedObj = {};
        var values = {};
        values[groupStatusCacheKey] = cachedObj;
        cwc.storeValuesInCurrentTab(values);
      }
      return cachedObj;
    },
    cleanCache: function(tab) {
      //override the datastore by "groupstatus" with null value.
      var values = {};
      values[groupStatusCacheKey] = null;
      cwc.storeValuesInTab(tab, values);
    },
    /**
     * generate cache key by id
     */
    genCacheKey: function(id) {
      return hpsm.sCurrentForm + "_" + id;
    },
    
    /**
     * get the cached expand status by id
     */
    loadState: function(id) {
      return this.getCachedObj()[this.genCacheKey(id)];
    },

    /**
     * save the expand status in cache by collapse section ID
     */
    saveState: function(id, status) {
      this.getCachedObj()[this.genCacheKey(id)] = status;
    }
  };
  
  
  /**
   * auto expand default expanding sections
   */
  function initSections() {
    for (sectionId in initialSectionStatus) {
      var storedStatus = groupStateCache.loadState(sectionId);
      if (storedStatus === false ||
          storedStatus == null && !initialSectionStatus[sectionId]) {
        continue;
      }
      var section = getSection(sectionId);
      var pSection = section.getParentSection(); 
      if (pSection != null && !pSection.isExpanded()) {
        pSection.addPendingExpandChild(section);
        continue;
      }
      expand(section);
    }
    initialSectionStatus = null;
  }

  return {
    // Register a collapsible section to initialize.
    // A call to this function is generated by our XLS for each section that has to appear expanded when the page loads.
    // Sections that need to be collapsed upon page load don't need to be initialized.
    reg: function(cntId, expanded) {
      initialSectionStatus[cntId] = expanded;
    },
    // Initialize all registered collapsible sections.
    init: function() {
      initSections();
    },
    // Called by the onclick event handler.
    toggleSection: function(elem, cntId) {
      toggleSize(cntId);
      elem.focus();
    },
    // Called by the onkeydown event handler of the collapse/expand button.
    btnkeydownHandler: function(e) {
      var key = getKey(e);
      if (key==13) { // Enter key.
        var elem = getTarget(e);
        var cntId = elem.id.replace('Toggle', '');
        toggleSize(cntId);
      }
      if (e.stopPropagation ) { e.stopPropagation(); }
      e.cancelBubble = true;
      if (e.preventDefault) { e.preventDefault(); }
      e.returnValue = false;
    },
    //cleanup cache when tab closed
    cleanCache: function(tab) {
      groupStateCache.cleanCache(tab);
    },
    getSectionObj: function(cntId) {
      return getSection(cntId);
    },
    expandSection: function(section) {
      expand(section);
    }
  };
}();


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
