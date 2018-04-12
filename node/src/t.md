#### unit test不能检测出接口变化

##### js interface的变化

```js
// refreshAppliance.js

function addAppliance(location) {
  try {
    dbClient.add(location)
  } catch (err) {
    dbClient.remove(location)
    throw err
  }
}


//refreshAppliance-test.js
it('remove appliance object when failing to add appliance', () => {

  let add = sinon.stub(dbClient, 'add')
  let remove = sinon.stub(dbClient, 'remove')

  add.throws(new Error())
  refreshAppliance.addAppliance(location)
  sinon.assert.callOnce(remove)
})

```

比如addAppliance写了一个UT， 这个时候，另外的功能导致了`dbClient.remove(location)`修改为`dbClient.remove(uri)`. 这个时候这个case任然可以通过，而我们没有地方可以发现这个错误。


##### Oneview接口的错误

如果oneview login的接口不想下兼容。addAppliance的异常case也用UT来测试，这个时候不能发现这个变化，因为UT中rest请求会使用mock的结果。而我们又默认自动化测试不会再手动测试了。这个问题就有可能release了都不会发现。

##### elasticsearch接口的变化

同上


#### 测试用例很难mapping到UT

在开发一个feature，设计case是从行为出发，比如添加appliance，从case的角度，会有
a: 能够正常添加appliance

b: 添加已存在的appliance，返回“appliance已存在”错误。

c: 添加不能访问到的appliance，返回“无法连接到appliance”的错误。appliance没有被添加



但是对于UT来说。设计case是从逻辑覆盖出发。

```js
//refreshAppliance.js
function addAppliance(location) {
  let id = uuid()
  try {
    basic.lock()
    probe(location)
    validateAppliance()
    saveApplianceObject()
    saveResources()
    startScmb()
  } catch(err) {
    db.clearIfNeed()
    throw err
  } finally {
    basic.unlock()
  }
}

function validate() {
  if (exist in db) {
    throw 'appliance已存在'
  }
}
```
从开发角度，UT我就是一个正常逻辑的case，然后有一个其中一个调用跑出异常的case。 然后validate有两个case。


```js

it('UT1 could add appliance', () => {
  mockAlldependency()
  addAppliance(location)
  assertInterfacesAreCalledInOrder()
})

it('UT2 unlock when throwing error', () => {
  let probe = mockProbe().throws()
  let lock = mockLock()
  let unlock = mockUnlock()
  let validateAppliance = mockValidateAppliance()
  addAppliance(location)

  assertCallOnce(lock, probe, unlock)
  assertNotCall(validateAppliance)

})

it('UT3 validate passes if appliance does not exist', () => {
  try {
    validateAppliance()
  } catch(err) {
    assert.fail()
  }
})


it('UT4 validate fails if appliance exists', () => {
  mock()
  try {
    validateAppliance()
    assert.fail()
  } catch(err) {
    assert(err.message === 'appliance已存在')
  }
})

```

这个时候，一个case就会对应到很多UT上，比如case `a` 会对应到`UT1 + UT3`, case `b`会对应到`UT2 + UT4`，如果是实际代码对应关系会更加复杂。c会对应到`UT2 + xxx`

问题是这个时候很难管理我们的测试到底已经覆盖了什么。


#### 导致UT难以维护

UT变化频繁，很容易导致组合case失效或者残缺。或者会导致大家不敢修改UT，代码无法改动，出现很多诡异的UT不知道是干嘛的。

而且对代码的一点点修改就可能破坏这种组合覆盖的case。如果有db层跑出了原生的异常，导致页面显示500错误，这个时候做了一下修改包装了一下异常。添加了新的case来覆盖，这个时候b，c用例已经被破坏，但是无法通过测试保证。

```js
//refreshAppliance.js
function addAppliance(location) {
  let id = uuid()
  try {
    basic.lock()
    probe(location)
    validateAppliance()
    saveApplianceObject()
    saveResources()
    startScmb()
  } catch(err) {
    db.clearIfNeed()
    throw new Error('添加appliance失败')
  } finally {
    basic.unlock()
  }
}

```


而集成测试的case能够明确对应到功能上，方便统计覆盖率。而且功能不变，case就不会变化。
