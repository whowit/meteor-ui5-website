
# Roadmap

## Model

### Next up
1. Add basic filter support
1. List binding to array properties of single documents

### Planned
1. Add support for two-way binding (requires allow write to collections - not Meteor best practice which is update via method).
2. Add TreeBinding model (I think that controls that can use this might be deprecated - check first.)
3. Add multifilter support (where single filter object is itself an array of filters with
  and/or conditions defined between them).

## Demo

### Next up
1. Fix filter and sorter not working with ODataModel. (EmployeesOData-dbg.controller.js)
1. Remove debugging version in UI5 bootstrap and/or make our code work with debugging on / off.

### Planned
1. Add comprehensive demo app that showcases many features of UI5 and shows source code for how to do it.
1. Build tutorial around ToDo's - seems to be industry standard simple demo/tutorial app.
