const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("YmmoModule", (m) => {
  const ymmo = m.contract("Ymmo");

  return { ymmo };
});
