# BookChain

A peer to peer library powered by smart contracts and chainlink enabled RFID hardware.

Note: this project is still in early development stages.

**Contents:**

- `rfid-interface`: (python) covers the stack from the serial port hardware interface to running an external adapter server through flask. Also has the job specs for running the external adapter on a chainlink node. Lots going on here. All good stuff.
- `contracts`: (solidity) ethereum contracts that contain the main business logic for the peer to peer library. `Library.sol` is the main contract here - connects to external adapter through chainlink node and holds the state of all entries (books) in the system. 
- `frontend`: (HTML/JS) frontend web3 app to interface with the smart contracts.

## Build/run instructions

**Start external adapter server**:
```
cd rfid-adapter
./server.sh
```
This will expose the RFID external adapter server at  https://p2plib-adapter.loca.lt (if the URL is available). 

A node operator will need to add this job in order for the contract to work (and the contract oracle address and job id also have to be updated).

To create this job on a running chainlink node, refer to `rfid_adapter/jobspecs.json`. 

**Deploy contracts**:

We used the [remix](remix.ethereum.org) IDE for deploying smart contracts. Code in the `contracts` folder can be copied directly to remix and deployed.

Depending on how the external adapter was deployed, the  oracle addresses and job ids will need to be changed.

**Start front end server**:
```
cd frontend
./server.sh
```
This will start an http server at https://link-library.loca.lt (if URL is available). 

#### Things that can go wrong:

Adapter --> Contract:

- Chainlink node details don't match the external adapter.
- Localtunnel URL is incorrect.

Contract --> Frontend:

- ABI from deployed contract doesn't match ABI in `frontend/index.js`.
- Deployed contract address doesn't match the frontend.
- Localtunnel URL is incorrect.

## Architecture

TODO
