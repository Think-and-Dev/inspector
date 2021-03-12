# liquidation

**Liquidation** is a bot for liquidate all borrowers that are shortfall, to use in `rLending-protocol`.

Through this application, the potentials liquidators will'be enable to liquidate accounts automatically.

`yarn run populate`

`yarn run liquidate`

### - populate
This method search all borrow logs event in the blockchain, and save the borrowers in database

### - liquidate
Pull all borrows from database, calculate the max amount to liquidate, and liquidate them.

# How to (developers)
## Requirements:
---
- yarn ^v1.22
- node 12.x
- node database 4.4.x
- file configuration (constants.js)

---
## Usage
---
1. Clone the repository to your localhost.
2. Open terminal into folder project.
3. Run `yarn install`
4. Run the desired command, `yarn run populate` or `yarn run liquidate`