const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { classifyVersion } = require('./release-channel.cjs');
const source = fs.readFileSync(path.join(__dirname, '../src/services/releasePolicy.ts'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const policy = {};
vm.runInNewContext(code, { exports: policy, require });
const { shouldProposeUpdate, selectRelease, versionChannel, installerAsset } = policy;
const release = (tag_name, prerelease = false, draft = false) => ({ tag_name, prerelease, draft, assets: [{ name: 'App-Setup.exe' }] });

assert.equal(shouldProposeUpdate('v2.2.2', '2.3.0'), true);
for (const target of ['2.2.2', '2.1.0', '2.3.0-beta.1', '2.3.0-dev.1', 'invalid']) assert.equal(shouldProposeUpdate('2.2.2', target), false);
for (const current of ['2.3.0-dev.1', '2.3.0-beta.1']) {
  for (const target of ['2.2.2', '2.3.0', '2.4.0', '2.3.0-dev.2']) assert.equal(shouldProposeUpdate(current, target), false);
}
assert.equal(selectRelease([release('2.5.0', false, true), release('2.4.0', true), release('2.3.0-dev.1'), release('2.2.2')], 'stable').tag_name, '2.2.2');
const candidates = [release('2.3.0-dev.2', true), release('2.3.0-dev.10', true), release('2.3.0-beta.1', true), release('2.3.0')];
assert.equal(selectRelease(candidates, 'dev').tag_name, '2.3.0-dev.10');
assert.equal(selectRelease(candidates, 'beta').tag_name, '2.3.0-beta.1');
assert.equal(selectRelease(candidates, 'stable').tag_name, '2.3.0');
assert.equal(selectRelease([], 'dev'), null);
assert.equal(selectRelease([release('invalid')], 'stable'), null);
assert.equal(installerAsset({ assets: [{ name: 'App-Portable.exe' }, { name: 'App-arm64-Setup.exe' }, { name: 'App-Setup.exe' }] }).name, 'App-Setup.exe');
for (const version of ['2.3.0', '2.3.0-beta.1', '2.3.0-dev.1', '2.3.0-rc.1', '2.3.0-nightly.1']) assert.equal(classifyVersion(version), versionChannel(version));
for (const version of ['2.3.0.beta', '2.3.0-dev.01', '02.3.0']) assert.throws(() => classifyVersion(version));
console.log('Release policy tests passed: stable, beta, dev, ordering, drafts, installers, version syntax.');
