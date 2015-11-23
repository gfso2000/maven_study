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

