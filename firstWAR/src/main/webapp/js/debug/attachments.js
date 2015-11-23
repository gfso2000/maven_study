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
