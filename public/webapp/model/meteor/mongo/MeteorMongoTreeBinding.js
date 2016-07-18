/*!
 * ${copyright}
 */

// Provides the JSON model implementation of a list binding
sap.ui.define(['jquery.sap.global', 'sap/ui/model/TreeBinding'],
  function(jQuery, TreeBinding) {
    "use strict";


    /**
     *
     * @class
     * Tree binding implementation for JSON format.
     *
     * The tree data structure may contain JSON objects and also arrays. If using arrays and don't want to bind every array data in the data structure you can
     * specify a parameter <code>arrayNames</code> in the mParameters which contains the names of the arrays in a string array which should be bound for the tree.
     * An array not included there won't be bound. If an array is included but it is nested in another parent array which isn't included in the names list it won't be bound.
     * So make sure that the parent array name is also included. If the tree data structure doesn't include any arrays you don't have to specify this parameter at all.
     *
     * @param {sap.ui.model.json.JSONModel} [oModel]
     * @param {string}
     *         sPath the path pointing to the tree / array that should be bound
     * @param {object}
     *         [oContext=null] the context object for this databinding (optional)
     * @param {array}
     *         [aFilters=null] predefined filter/s contained in an array (optional)
     * @param {object}
     *         [mParameters=null] additional model specific parameters (optional)
     * @param {string[]} [mParameters.arrayNames]
     *         If this parameter is specified with an array of string names, these names will be used to construct the tree data structure.
     *         Only the nested objects contained in arrays, with names specified by mParameters.arrayNames, will be included in the tree.
     *         Of course this will only happen if all parent-nodes up to the top-level are also included.
     *         If you do NOT specify this parameter: by default all nested objects/arrays will be used to build the trees hierarchy.
     *
     * @alias meteor-model-demo.model.MeteorMongoTreeBinding
     * @extends sap.ui.model.TreeBinding
     */
    var MeteorMongoTreeBinding = TreeBinding.extend("meteor-model-demo.model.MeteorMongoTreeBinding", {

      constructor: function(oModel, sPath, oContext, aApplicationFilters, mParameters, aSorters) {
        TreeBinding.apply(this, arguments);
        if (!this.oContext) {
          this.oContext = "";
        }
        this._mLengthsCache = {};
        this.filterInfo = {};
        this.filterInfo.aFilteredContexts = [];
        this.filterInfo.oParentContext = {};

        if (aApplicationFilters) {
          if (this.oModel._getObject(this.sPath, this.oContext)) {
            this.filter(aApplicationFilters, FilterType.Application);
          }
        }

      }

    });

    /**
     * Return root contexts for the tree
     *
     * @return {object[]} the contexts array
     * @protected
     * @param {int} iStartIndex the startIndex where to start the retrieval of contexts
     * @param {int} iLength determines how many contexts to retrieve beginning from the start index.
     */
    MeteorMongoTreeBinding.prototype.getRootContexts = function(iStartIndex, iLength) {
      if (!iStartIndex) {
        iStartIndex = 0;
      }
      if (!iLength) {
        iLength = this.oModel.iSizeLimit;
      }

      var aContexts = [];
      var that = this;

      if (!this.oModel.isList(this.sPath)) {
        var oContext = this.oModel.getContext(this.sPath);
        if (this.bDisplayRootNode) {
          aContexts = [oContext];
        } else {
          aContexts = this.getNodeContexts(oContext, iStartIndex, iLength);
        }
      } else {
        var sContextPath = this._sanitizePath(this.sPath);

        jQuery.each(this.oModel._getObject(sContextPath), function(iIndex, oObject) {
          that._saveSubContext(oObject, aContexts, sContextPath, iIndex);
        });

        this._applySorter(aContexts);

        this._setLengthCache(sContextPath, aContexts.length);

        return aContexts.slice(iStartIndex, iStartIndex + iLength);
      }

      return aContexts;
    };

    /**
     * Sets the length cache.
     * Called by get*Contexts() to keep track of the child count (after filtering)
     */
    MeteorMongoTreeBinding.prototype._setLengthCache = function(sKey, iLength) {
      // keep track of the child count for each context (after filtering)
      this._mLengthsCache[sKey] = iLength;
    };

    /**
     * Check whether this Binding would provide new values and in case it changed,
     * inform interested parties about this.
     *
     * @param {boolean} bForceupdate
     *
     */
    MeteorMongoTreeBinding.prototype.checkUpdate = function(bForceupdate) {
      // apply filter again
      this.applyFilter();
      this._mLengthsCache = {};
      this._fireChange();
    };

    /**
     * internal function to apply the defined this.aSorters for the given array
     * @param {array} aContexts the context array which should be sorted (inplace)
     */
    MeteorMongoTreeBinding.prototype._applySorter = function(aContexts) {
      var that = this;
      SorterProcessor.apply(aContexts, this.aSorters, function(oContext, sPath) {
          return that.oModel.getProperty(sPath, oContext);
        },
        function(oContext) {
          //the context path is used as a key for internal use in the SortProcessor.
          return oContext.getPath();
        });
    };

    /**
     * Return node contexts for the tree
     * @param {object} oContext to use for retrieving the node contexts
     * @param {int} iStartIndex the startIndex where to start the retrieval of contexts
     * @param {int} iLength determines how many contexts to retrieve beginning from the start index.
     * @return {object[]} the contexts array
     * @protected
     */
    MeteorMongoTreeBinding.prototype.getNodeContexts = function(oContext, iStartIndex, iLength) {
      if (!iStartIndex) {
        iStartIndex = 0;
      }
      if (!iLength) {
        iLength = this.oModel.iSizeLimit;
      }

      var sContextPath = this._sanitizePath(oContext.getPath());

      var aContexts = [],
        that = this,
        oNode = this.oModel._getObject(sContextPath),
        aArrayNames = this.mParameters && this.mParameters.arrayNames,
        aChildArray;

      if (oNode) {
        if (aArrayNames && jQuery.isArray(aArrayNames)) {
          jQuery.each(aArrayNames, function(iIndex, sArrayName) {
            aChildArray = oNode[sArrayName];
            if (aChildArray) {
              jQuery.each(aChildArray, function(sSubName, oSubChild) {
                that._saveSubContext(oSubChild, aContexts, sContextPath, sArrayName + "/" + sSubName);
              });
            }
          });
        } else {
          jQuery.sap.each(oNode, function(sName, oChild) {
            if (jQuery.isArray(oChild)) {
              jQuery.each(oChild, function(sSubName, oSubChild) {
                that._saveSubContext(oSubChild, aContexts, sContextPath, sName + "/" + sSubName);
              });
            } else if (typeof oChild == "object") {
              that._saveSubContext(oChild, aContexts, sContextPath, sName);
            }
          });
        }
      }

      this._applySorter(aContexts);

      this._setLengthCache(sContextPath, aContexts.length);

      return aContexts.slice(iStartIndex, iStartIndex + iLength);
    };

    /**
     * Returns if the node has child nodes.
     *
     * @param {object} oContext the context element of the node
     * @return {boolean} true if node has children
     *
     * @public
     */
    MeteorMongoTreeBinding.prototype.hasChildren = function(oContext) {
      if (oContext == undefined) {
        return false;
      }
      return this.getChildCount(oContext) > 0;
    };

    /**
     * Makes sure the path is prepended and appended with a "/" if necessary.
     * @param {string} sContextPath the path to be checked
     */
    MeteorMongoTreeBinding.prototype._sanitizePath = function(sContextPath) {
      if (!jQuery.sap.endsWith(sContextPath, "/")) {
        sContextPath = sContextPath + "/";
      }
      if (!jQuery.sap.startsWith(sContextPath, "/")) {
        sContextPath = "/" + sContextPath;
      }
      return sContextPath;
    };


    /**
     * Retrieves the number of children for the given context.
     * Makes sure the child count is retrieved from the length cache, and fills the cache if necessary.
     * Calling it with no arguments or 'null' returns the number of root level nodes.
     *
     * @param {sap.ui.model.Context} oContext the context for which the child count should be retrieved
     * @return {int} the number of children for the given context
     * @public
     * @override
     */
    MeteorMongoTreeBinding.prototype.getChildCount = function(oContext) {
      //if oContext is null or empty -> root level count is requested
      var sPath = oContext ? oContext.sPath : this.getPath();
      sPath = this._sanitizePath(sPath);

      // if the length is not cached, call the get*Contexts functions to fill it
      if (this._mLengthsCache[sPath] === undefined) {
        if (oContext) {
          this.getNodeContexts(oContext);
        } else {
          this.getRootContexts();
        }
      }

      return this._mLengthsCache[sPath];
    };

    /**
     * Filters the tree according to the filter definitions.
     *
     * The filtering is applied recursively through the tree.
     * The parent nodes of filtered child nodes will also be displayed if they don't match the filter conditions.
     * All filters belonging to a group (=have the same path) are ORed and after that the
     * results of all groups are ANDed.
     *
     * @see sap.ui.model.TreeBinding.prototype.filter
     * @param {sap.ui.model.Filter[]} aFilters Array of filter objects
     * @param {sap.ui.model.FilterType} sFilterType Type of the filter which should be adjusted, if it is not given, the standard behaviour applies
     * @return {sap.ui.model.ClientTreeBinding} returns <code>this</code> to facilitate method chaining
     * @public
     */
    MeteorMongoTreeBinding.prototype.filter = function(aFilters, sFilterType) {
      // The filtering is applied recursively through the tree and stores all filtered contexts and its parent contexts in an array.

      // wrap single filters in an array
      if (aFilters && !jQuery.isArray(aFilters)) {
        aFilters = [aFilters];
      }

      if (sFilterType == FilterType.Application) {
        this.aApplicationFilters = aFilters || [];
      } else if (sFilterType == FilterType.Control) {
        this.aFilters = aFilters || [];
      } else {
        //Previous behaviour
        this.aFilters = aFilters || [];
        this.aApplicationFilters = [];
      }


      aFilters = this.aFilters.concat(this.aApplicationFilters);
      if (aFilters.length == 0) {
        this.aAllFilters = null;
      } else {
        this.aAllFilters = aFilters;
        this.applyFilter();
      }
      this._mLengthsCache = {};
      this._fireChange({
        reason: "filter"
      });
      // TODO remove this if the filter event is removed
      this._fireFilter({
        filters: aFilters
      });

      return this;
    };

    /**
     * Apply the current defined filters on the existing dataset.
     * @private
     */
    MeteorMongoTreeBinding.prototype.applyFilter = function() {
      // reset previous stored filter contexts
      this.filterInfo.aFilteredContexts = [];
      this.filterInfo.oParentContext = {};
      // start with binding path root
      var oContext = this.oModel.getContext(this.sPath);
      this._applyFilterRecursive(oContext);
    };

    MeteorMongoTreeBinding.prototype._saveSubContext = function(oNode, aContexts, sContextPath, sName) {
      // only collect node if it is defined (and not null), because typeof null == "object"!
      if (oNode && typeof oNode == "object") {
        var oNodeContext = this.oModel.getContext(sContextPath + sName);
        // check if there is a filter on this level applied
        if (this.aAllFilters && !this.bIsFiltering) {
          if (jQuery.inArray(oNodeContext, this.filterInfo.aFilteredContexts) != -1) {
            aContexts.push(oNodeContext);
          }
        } else {
          aContexts.push(oNodeContext);
        }
      }
    };

    /**
     * Sorts the contexts of this ClientTreeBinding.
     * The tree will be sorted level by level. So the nodes are NOT sorted absolute, but relative to their parent node,
     * to keep the hierarchy untouched.
     *
     * @param {sap.ui.model.Sorter[]} an array of Sorter instances which will be applied
     * @return {sap.ui.model.ClientTreeBinding} returns <code>this</code> to facilitate method chaining
     * @public
     */
    MeteorMongoTreeBinding.prototype.sort = function(aSorters) {
      aSorters = aSorters || [];
      this.aSorters = jQuery.isArray(aSorters) ? aSorters : [aSorters];

      this._fireChange({
        reason: ChangeReason.Sort
      });

      return this;
    };


    /**
     * Filters the tree recursively.
     * Performs the real filtering and stores all filtered contexts and its parent context into an array.
     * @param {object} oParentContext the context where to start. The children of this node context are then filtered recursively.
     * @private
     */
    MeteorMongoTreeBinding.prototype._applyFilterRecursive = function(oParentContext) {

      var that = this,
        aFilteredContexts = [];

      if (jQuery.isEmptyObject(this.aAllFilters)) {
        return;
      }

      this.bIsFiltering = true;
      var aUnfilteredContexts = this.getNodeContexts(oParentContext);
      this.bIsFiltering = false;

      if (aUnfilteredContexts.length > 0) {
        jQuery.each(aUnfilteredContexts, function(i, oContext) {
          that._applyFilterRecursive(oContext);
        });

        aFilteredContexts = FilterProcessor.apply(aUnfilteredContexts, this.aAllFilters, function(oContext, sPath) {
          return that.oModel.getProperty(sPath, oContext);
        });

        if (aFilteredContexts.length > 0) {
          jQuery.merge(this.filterInfo.aFilteredContexts, aFilteredContexts);
          this.filterInfo.aFilteredContexts.push(oParentContext);
          this.filterInfo.oParentContext = oParentContext;
        }
        // push additionally parentcontexts if any children are already included in filtered contexts
        if (jQuery.inArray(this.filterInfo.oParentContext, aUnfilteredContexts) != -1) {
          this.filterInfo.aFilteredContexts.push(oParentContext);
          // set the parent context which was added to be the new parent context
          this.filterInfo.oParentContext = oParentContext;
        }
      }
    };


    return MeteorMongoTreeBinding;

  });