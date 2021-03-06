var Base = require('base');
describe('class', function () {
    it('support initializer and destructor', function () {
        var initializerCalled = 0,
            destructorCalled = 0;

        var T = Base.extend({
            initializer: function () {
                initializerCalled++;
            },
            destructor: function () {
                destructorCalled++;
            }
        }, {
            name: 'TestTT'
        });

        expect(T.toString().indexOf('TestTT')).not.to.be(-1);

        var t = new T();

        expect(initializerCalled).to.be(1);

        t.destroy();

        expect(destructorCalled).to.be(1);
    });

    it('support extension', function () {
        var initializer = [],
            destructor = [];

        function Ext1() {
            initializer.push(1);
        }

        Ext1.prototype = {
            constructor: Ext1,
            __destructor: function () {
                destructor.push(1);
            }

        };

        function Ext2() {
            initializer.push(2);
        }

        Ext2.prototype = {
            constructor: Ext2,
            __destructor: function () {
                destructor.push(2);
            }
        };

        var T = Base.extend([Ext1, Ext2], {
            initializer: function () {
                initializer.push(3);
            },

            destructor: function () {
                destructor.push(3);
            }
        });

        var t = new T();

        expect(initializer).to.eql([1, 2, 3]);

        t.destroy();

        expect(destructor).to.eql([3, 2, 1]);
    });

    it('support plugin config', function () {

        var initializer = [],
            destructor = [];

        function Plugin1() {

        }

        Plugin1.prototype = {

            constructor: Plugin1,

            pluginInitializer: function () {
                initializer.push(1);
            },

            pluginDestructor: function () {
                destructor.push(1);
            }

        };


        function Plugin2() {

        }

        Plugin2.prototype = {

            constructor: Plugin2,

            pluginInitializer: function () {
                initializer.push(2);
            },

            pluginDestructor: function () {
                destructor.push(2);
            }

        };

        var T = Base.extend({
            initializer: function () {
                initializer.push(3);
            },
            destructor: function () {
                destructor.push(3);
            }
        });

        var t = new T({
            plugins: [Plugin1, new Plugin2()]
        });

        expect(t.get('plugins').length).to.be(2);

        expect(initializer).to.eql([3, 1, 2]);

        t.destroy();

        expect(destructor).to.eql([1, 2, 3]);

    });

    it('support plug unplug', function () {

        var initializer = [],
            destructor = [];

        function Plugin1() {

        }

        Plugin1.prototype = {

            pluginId: 'plugin1',

            constructor: Plugin1,

            pluginInitializer: function (tt) {
                expect(tt.isT).to.be(1);
                initializer.push(1);
            },

            pluginDestructor: function (tt) {
                expect(tt.isT).to.be(1);
                destructor.push(1);
            }

        };


        function Plugin2() {

        }

        Plugin2.prototype = {

            constructor: Plugin2,

            pluginInitializer: function (tt) {
                expect(tt.isT).to.be(1);
                initializer.push(2);
            },

            pluginDestructor: function (tt) {
                expect(tt.isT).to.be(1);
                destructor.push(2);
            }

        };

        var T = Base.extend({
            isT: 1,
            initializer: function () {
                initializer.push(3);
            },
            destructor: function () {
                destructor.push(3);
            }
        });

        var t = new T();

        expect(initializer).to.eql([3]);

        expect(t.get('plugins').length).to.be(0);

        t.plug(Plugin1);

        expect(t.get('plugins').length).to.be(1);

        expect(initializer).to.eql([3, 1]);

        var p2;

        t.plug(p2 = new Plugin2());

        expect(t.get('plugins').length).to.be(2);

        expect(initializer).to.eql([3, 1, 2]);

        t.unplug(p2);

        expect(t.get('plugins').length).to.be(1);


        expect(destructor).to.eql([2]);

        t.unplug('plugin1');

        expect(t.get('plugins').length).to.be(0);

        expect(destructor).to.eql([2, 1]);

        t.destroy();

        expect(destructor).to.eql([2, 1, 3]);

    });

    it('support unplug all', function () {

        var initializer = [],
            destructor = [];

        function Plugin1() {

        }

        Plugin1.prototype = {

            constructor: Plugin1,

            pluginInitializer: function () {
                initializer.push(1);
            },

            pluginDestructor: function () {
                destructor.push(1);
            }

        };


        function Plugin2() {

        }

        Plugin2.prototype = {

            constructor: Plugin2,

            pluginInitializer: function () {
                initializer.push(2);
            },

            pluginDestructor: function () {
                destructor.push(2);
            }

        };

        var T = Base.extend({
            initializer: function () {
                initializer.push(3);
            },
            destructor: function () {
                destructor.push(3);
            }
        });

        var t = new T({
            plugins: [Plugin1, new Plugin2()]
        });

        t.unplug();

        expect(t.get('plugins').length).to.be(0);

        expect(destructor).to.eql([1, 2]);

    });

    it('support attr bind', function () {

        var xx = [];

        var T = Base.extend({
            '_onSetXx': function (v) {
                xx.push(v);
            }
        }, {
            ATTRS: {
                xx: {}
            }
        });

        var t = new T({
            xx: 1
        });

        expect(xx).to.eql([1]);

        t.set('xx', 2);

        expect(xx).to.eql([1, 2]);


    });

    it('_onSet will run by order', function () {
        var order = [];
        var X = Base.extend({
            _onSetX: function () {
                order.push(1);
            },
            '_onSetZ': function () {
                order.push(2);
            }
        }, {
            ATTRS: {
                x: {
                    value: 2
                },
                z: {
                    value: 2
                }
            }
        });

        var Y = X.extend({
            _onSetY: function () {
                order.push(33);
            },
            _onSetX: function () {
                order.push(11);
            }
        }, {
            ATTRS: {
                y: {
                    value: 1
                }
            }
        });

        var y = new Y();

        expect(y).not.to.be(null);

        expect(order).to.eql([11, 2, 33]);
    });
});