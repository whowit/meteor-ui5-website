
## Binding paths for whole collections

In this example where we want all documents, we simply bind the table to the collection.  Our binding path is therefore "`/Orders`" which consists of the following components:

| Component | Description |
| - | - |
| `/` | The root context - ie this binding is not relative to any parent control binding. |
| `Orders` | The name of the Mongo database collection. |

## Binding path used in this demo

We bind the table to all of the orders in the collection as follows:
```xml
<Table id="OrdersTable" items="{/Orders}">
      <!-- Define columns and item template here -->
</Table>
```