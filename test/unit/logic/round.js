/* eslint-disable mocha/no-skipped-tests */
/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

'use strict';

var rewire = require('rewire');
var Promise = require('bluebird');
var slots = require('../../../helpers/slots.js');
var bignum = require('../../../helpers/bignum.js');
var genesisBlock = require('../../data/genesis_block.json');
var DBSandbox = require('../../common/db_sandbox').DBSandbox;

var Round = rewire('../../../logic/round.js');

describe('rounds', () => {
	var db;
	var dbSandbox;
	var round;
	var validScope;

	before(done => {
		dbSandbox = new DBSandbox(__testContext.config.db, 'rounds_logic');
		dbSandbox.create((err, __db) => {
			db = __db;

			validScope = {
				backwards: false,
				round: 1,
				roundOutsiders: [],
				roundDelegates: [genesisBlock.generatorPublicKey],
				roundFees: slots.delegates,
				roundRewards: [10],
				library: {
					db: undefined,
					logger: {
						trace: sinonSandbox.spy(),
						debug: sinonSandbox.spy(),
						info: sinonSandbox.spy(),
						log: sinonSandbox.spy(),
						warn: sinonSandbox.spy(),
						error: sinonSandbox.spy(),
					},
				},
				modules: {
					accounts: {
						mergeAccountAndGet: sinonSandbox.stub(),
					},
				},
				block: {
					generatorPublicKey: genesisBlock.generatorPublicKey,
					id: genesisBlock.id,
					height: 1,
					timestamp: 100,
				},
			};
			done();
		});
	});

	function isPromise(obj) {
		return typeof obj.then == 'function';
	}

	describe('constructor', () => {
		var scope;

		describe('when calling with required properties', () => {
			before(() => {
				scope = _.cloneDeep(validScope);
				round = new Round(_.cloneDeep(scope), db);
			});

			it('should return Round instance', () => {
				expect(round).to.be.instanceof(Round);
			});

			it('should set scope', () => {
				expect(round.scope).to.deep.equal(scope);
			});

			it('should set t', () => {
				expect(round.t).to.deep.equal(db);
			});
		});

		describe('when calling with missing properties', () => {
			beforeEach(() => {
				scope = _.cloneDeep(validScope);
			});

			describe.skip('library', () => {
				it('should throw', () => {
					var property = 'library';
					delete scope[property];
					try {
						round = new Round(_.cloneDeep(scope), db);
					} catch (err) {
						expect(err).to.equal(
							`Missing required scope property: ${property}`
						);
					}
				});
			});

			describe.skip('modules', () => {
				it('should throw', () => {
					var property = 'modules';
					delete scope[property];
					try {
						round = new Round(_.cloneDeep(scope), db);
					} catch (err) {
						expect(err).to.equal(
							`Missing required scope property: ${property}`
						);
					}
				});
			});

			describe.skip('block', () => {
				it('should throw', () => {
					var property = 'block';
					delete scope[property];
					try {
						round = new Round(_.cloneDeep(scope), db);
					} catch (err) {
						expect(err).to.equal(
							`Missing required scope property: ${property}`
						);
					}
				});
			});

			describe('round', () => {
				it('should throw', () => {
					var property = 'round';
					delete scope[property];
					try {
						round = new Round(_.cloneDeep(scope), db);
					} catch (err) {
						expect(err).to.equal(
							`Missing required scope property: ${property}`
						);
					}
				});
			});

			describe('backwards', () => {
				it('should throw', () => {
					var property = 'backwards';
					delete scope[property];
					try {
						round = new Round(_.cloneDeep(scope), db);
					} catch (err) {
						expect(err).to.equal(
							`Missing required scope property: ${property}`
						);
					}
				});
			});

			describe('when finish round', () => {
				beforeEach(() => {
					// Set finishRound, so now we need additional properties
					scope.finishRound = true;
				});

				describe('roundFees', () => {
					it('should throw', () => {
						var property = 'roundFees';
						delete scope[property];
						try {
							round = new Round(_.cloneDeep(scope), db);
						} catch (err) {
							expect(err).to.equal(
								`Missing required scope property: ${property}`
							);
						}
					});
				});

				describe('roundRewards', () => {
					it('should throw', () => {
						var property = 'roundRewards';
						delete scope[property];
						try {
							round = new Round(_.cloneDeep(scope), db);
						} catch (err) {
							expect(err).to.equal(
								`Missing required scope property: ${property}`
							);
						}
					});
				});

				describe('roundDelegates', () => {
					it('should throw', () => {
						var property = 'roundDelegates';
						delete scope[property];
						try {
							round = new Round(_.cloneDeep(scope), db);
						} catch (err) {
							expect(err).to.equal(
								`Missing required scope property: ${property}`
							);
						}
					});
				});

				describe('roundOutsiders', () => {
					it('should throw', () => {
						var property = 'roundOutsiders';
						delete scope[property];
						try {
							round = new Round(_.cloneDeep(scope), db);
						} catch (err) {
							expect(err).to.equal(
								`Missing required scope property: ${property}`
							);
						}
					});
				});
			});
		});
	});

	describe('mergeBlockGenerator', () => {
		var scope;

		describe('when going forward', () => {
			var args = null;

			before(() => {
				scope = _.cloneDeep(validScope);
				scope.backwards = false;
				round = new Round(_.cloneDeep(scope), db);
				args = {
					blockId: scope.block.id,
					producedblocks: 1,
					publicKey: scope.block.generatorPublicKey,
					round: scope.round,
				};
				scope.modules.accounts.mergeAccountAndGet.callsArgWith(1, null, args);
				return round.mergeBlockGenerator();
			});

			it('should call modules.accounts.mergeAccountAndGet with proper params', () => {
				expect(
					round.scope.modules.accounts.mergeAccountAndGet
				).to.be.calledWith(args);
			});
		});

		describe('when going backwards', () => {
			var args = null;

			before(() => {
				scope = _.cloneDeep(validScope);
				scope.backwards = true;
				round = new Round(_.cloneDeep(scope), db);
				args = {
					blockId: scope.block.id,
					producedblocks: -1,
					publicKey: scope.block.generatorPublicKey,
					round: scope.round,
				};
				scope.modules.accounts.mergeAccountAndGet.callsArgWith(1, null, args);
				return round.mergeBlockGenerator();
			});

			it('should call modules.accounts.mergeAccountAndGet with proper params', () => {
				expect(
					round.scope.modules.accounts.mergeAccountAndGet
				).to.be.calledWith(args);
			});
		});
	});

	describe('updateMissedBlocks', () => {
		var scope;
		var stub;
		var res;

		describe('when there are no outsiders', () => {
			before(() => {
				scope = _.cloneDeep(validScope);
				res = round.updateMissedBlocks();
			});

			it('should return t object', () => {
				expect(res).to.not.be.instanceOf(Promise);
				expect(res).to.deep.equal(db);
			});
		});

		describe('when there are outsiders', () => {
			before(() => {
				scope = _.cloneDeep(validScope);
				scope.roundOutsiders = ['abc'];
				round = new Round(_.cloneDeep(scope), db);
				stub = sinonSandbox.stub(db.rounds, 'updateMissedBlocks');
				stub
					.withArgs(scope.backwards, scope.roundOutsiders)
					.resolves('success');
				res = round.updateMissedBlocks();
			});

			it('should return promise', () => {
				expect(isPromise(res)).to.be.true;
			});

			it('query should be called with proper args', () => {
				return res.then(res => {
					expect(res).to.equal('success');
					expect(stub.calledWith(scope.backwards, scope.roundOutsiders)).to.be
						.true;
				});
			});
		});
	});

	describe('getVotes', () => {
		var stub;
		var res;
		var scope;

		before(() => {
			scope = _.cloneDeep(validScope);
			stub = sinonSandbox.stub(db.rounds, 'getVotes');
			stub.withArgs(scope.round).resolves('success');
			res = round.getVotes();
		});

		it('should return promise', () => {
			expect(isPromise(res)).to.be.true;
		});

		it('query should be called with proper args', () => {
			return res.then(res => {
				expect(res).to.equal('success');
				expect(stub.calledWith(scope.round)).to.be.true;
			});
		});
	});

	describe('updateVotes', () => {
		var getVotes_stub;
		var updateVotes_stub;
		var res;
		var scope;
		var delegate;

		describe('when getVotes returns at least one entry', () => {
			before(() => {
				scope = _.cloneDeep(validScope);

				delegate = {
					amount: 10000,
					delegate:
						'6a01c4b86f4519ec9fa5c3288ae20e2e7a58822ebe891fb81e839588b95b242a',
					address: '16010222169256538112L',
				};

				scope.library.db = db;
				scope.modules.accounts.generateAddressByPublicKey = function() {
					return delegate.address;
				};

				return db.task(t => {
					// Init stubs
					getVotes_stub = sinonSandbox.stub(t.rounds, 'getVotes');
					getVotes_stub.withArgs(scope.round).resolves([delegate, delegate]);
					updateVotes_stub = sinonSandbox.stub(t.rounds, 'updateVotes');
					updateVotes_stub
						.withArgs(delegate.address, delegate.amount)
						.resolves('QUERY');

					round = new Round(_.cloneDeep(scope), t);
					res = round.updateVotes();
				});
			});

			it('should return promise', () => {
				expect(isPromise(res)).to.be.true;
			});

			it('getVotes query should be called with proper args', () => {
				expect(getVotes_stub.calledWith(scope.round)).to.be.true;
			});

			it('updateVotes should be called twice', () => {
				expect(updateVotes_stub.calledTwice).to.be.true;
			});

			it('updateVotes query should be called with proper args', () => {
				expect(
					updateVotes_stub.alwaysCalledWith(delegate.address, delegate.amount)
				).to.be.true;
			});

			it('getVotes result should contain 2 queries', () => {
				return res.then(res => {
					expect(res).to.deep.equal(['QUERY', 'QUERY']);
				});
			});
		});

		describe('when getVotes returns no entries', () => {
			before(() => {
				scope = _.cloneDeep(validScope);

				delegate = {
					amount: 10000,
					delegate:
						'6a01c4b86f4519ec9fa5c3288ae20e2e7a58822ebe891fb81e839588b95b242a',
					address: '16010222169256538112L',
				};

				scope.library.db = db;
				scope.modules.accounts.generateAddressByPublicKey = function() {
					return delegate.address;
				};

				return db.task(t => {
					// Init stubs
					getVotes_stub = sinonSandbox.stub(t.rounds, 'getVotes');
					getVotes_stub.withArgs(scope.round).resolves([]);
					updateVotes_stub = sinonSandbox.stub(t.rounds, 'updateVotes');
					updateVotes_stub
						.withArgs(delegate.address, delegate.amount)
						.resolves('QUERY');

					round = new Round(_.cloneDeep(scope), t);
					res = round.updateVotes();
				});
			});

			it('should return promise', () => {
				expect(isPromise(res)).to.be.true;
			});

			it('getVotes query should be called with proper args', () => {
				expect(getVotes_stub.calledWith(scope.round)).to.be.true;
			});

			it('updateVotes should be not called', () => {
				expect(updateVotes_stub.called).to.be.false;
			});
		});
	});

	describe('markBlockId', () => {
		var updateBlockId_stub;
		var res;
		var scope;

		describe('when going forward', () => {
			before(() => {
				scope = _.cloneDeep(validScope);
				scope.backwards = false;
				round = new Round(_.cloneDeep(scope), db);
			});

			it('should return t object', () => {
				var res = round.markBlockId();
				expect(isPromise(res)).to.be.false;
				expect(res).to.deep.equal(db);
			});
		});

		describe('when going backwards', () => {
			before(() => {
				scope = _.cloneDeep(validScope);
				scope.backwards = true;
				updateBlockId_stub = sinonSandbox.stub(db.rounds, 'updateBlockId');
				updateBlockId_stub.withArgs(scope.block.id, '0').resolves('success');
				round = new Round(_.cloneDeep(scope), db);
				res = round.markBlockId();
			});

			it('should return promise', () => {
				expect(isPromise(res)).to.be.true;
			});

			it('updateBlockId query should be called with proper args', () => {
				return res.then(res => {
					expect(res).to.equal('success');
					expect(updateBlockId_stub.calledWith(scope.block.id, '0')).to.be.true;
				});
			});
		});
	});

	describe('flushRound', () => {
		var stub;
		var res;

		before(() => {
			stub = sinonSandbox.stub(db.rounds, 'flush');
			stub.withArgs(validScope.round).resolves('success');
			res = round.flushRound();
		});

		it('should return promise', () => {
			expect(isPromise(res)).to.be.true;
		});

		it('query should be called with proper args', () => {
			return res.then(res => {
				expect(res).to.equal('success');
				expect(stub.calledWith(validScope.round)).to.be.true;
			});
		});
	});

	describe('truncateBlocks', () => {
		var stub;
		var res;

		before(() => {
			stub = sinonSandbox.stub(db.rounds, 'truncateBlocks');
			stub.withArgs(validScope.block.height).resolves('success');
			res = round.truncateBlocks();
		});

		it('should return promise', () => {
			expect(isPromise(res)).to.be.true;
		});

		it('query should be called with proper args', () => {
			return res.then(res => {
				expect(res).to.equal('success');
				expect(stub.calledWith(validScope.block.height)).to.be.true;
			});
		});
	});

	describe('restoreRoundSnapshot', () => {
		var res;

		before(() => {
			sinonSandbox
				.stub(db.rounds, 'restoreRoundSnapshot')
				.withArgs()
				.resolves('success');
			res = round.restoreRoundSnapshot();
		});

		it('should return promise', () => {
			expect(isPromise(res)).to.be.true;
		});

		it('query should be called with no args', () => {
			return res.then(res => {
				expect(res).to.equal('success');
				expect(db.rounds.restoreRoundSnapshot.calledWith()).to.be.true;
			});
		});
	});

	describe('restoreVotesSnapshot', () => {
		var stub;
		var res;

		before(() => {
			stub = sinonSandbox.stub(db.rounds, 'restoreVotesSnapshot');
			stub.withArgs().resolves('success');
			res = round.restoreVotesSnapshot();
		});

		it('should return promise', () => {
			expect(isPromise(res)).to.be.true;
		});

		it('query should be called with no args', () => {
			return res.then(res => {
				expect(res).to.equal('success');
				expect(stub.calledWith()).to.be.true;
			});
		});
	});

	describe('deleteRoundRewards', () => {
		var stub;
		var res;

		before(() => {
			stub = sinonSandbox.stub(db.rounds, 'deleteRoundRewards');
			stub.withArgs(validScope.round).resolves('success');
			res = round.deleteRoundRewards();
		});

		it('should return promise', () => {
			expect(isPromise(res)).to.be.true;
		});

		it('query should be called with no args', () => {
			return res.then(res => {
				expect(res).to.equal('success');
				expect(stub).to.have.been.calledWith(validScope.round);
			});
		});
	});

	describe('applyRound', () => {
		var res;
		var batch_stub;
		var insertRoundRewards_stub;
		var scope;

		function sumChanges(forward, backwards) {
			var results = {};
			forward.forEach(res => {
				if (results[res.publicKey]) {
					results[res.publicKey].balance += res.balance || 0;
					results[res.publicKey].u_balance += res.u_balance || 0;
					results[res.publicKey].rewards += res.rewards || 0;
					results[res.publicKey].fees += res.fees || 0;
				} else {
					results[res.publicKey] = {
						balance: res.balance || 0,
						u_balance: res.u_balance || 0,
						rewards: res.rewards || 0,
						fees: res.fees || 0,
					};
				}
			});
			backwards.forEach(res => {
				if (results[res.publicKey]) {
					results[res.publicKey].balance += res.balance || 0;
					results[res.publicKey].u_balance += res.u_balance || 0;
					results[res.publicKey].rewards += res.rewards || 0;
					results[res.publicKey].fees += res.fees || 0;
				} else {
					results[res.publicKey] = {
						balance: res.balance || 0,
						u_balance: res.u_balance || 0,
						rewards: res.rewards || 0,
						fees: res.fees || 0,
					};
				}
			});
			return results;
		}

		describe.skip('with no delegates', () => {
			describe('forward', () => {
				before(() => {
					scope = _.cloneDeep(validScope);
					scope.backwards = false;
					scope.roundDelegates = [];
					round = new Round(_.cloneDeep(scope), db);
					res = round.applyRound();
				});

				it('should return t object', () => {
					var res = round.markBlockId();
					expect(isPromise(res)).to.be.false;
					expect(res).to.deep.equal(db);
				});

				it('should not call mergeAccountAndGet', () => {
					expect(round.scope.modules.accounts.mergeAccountAndGet.called).to.be
						.false;
				});
			});

			describe('backwards', () => {
				before(() => {
					scope = _.cloneDeep(validScope);
					scope.backwards = true;
					scope.roundDelegates = [];
					round = new Round(_.cloneDeep(scope), db);
					res = round.applyRound();
				});

				it('should not call mergeAccountAndGet', () => {
					expect(round.scope.modules.accounts.mergeAccountAndGet.called).to.be
						.false;
				});

				it('should return t object', () => {
					var res = round.markBlockId();
					expect(isPromise(res)).to.be.false;
					expect(res).to.deep.equal(db);
				});
			});
		});

		describe('with only one delegate', () => {
			describe('when there are no remaining fees', () => {
				var forwardResults = [];
				var backwardsResults = [];

				before(() => {
					validScope.roundDelegates = [genesisBlock.generatorPublicKey];
					validScope.roundFees = slots.delegates; // 1 LSK fee per delegate, no remaining fees
				});

				describe('forward', () => {
					var called = 0;

					before(() => {
						round.scope.modules.accounts.mergeAccountAndGet.resetHistory();
						return db.task(t => {
							insertRoundRewards_stub = sinonSandbox
								.stub(t.rounds, 'insertRoundRewards')
								.resolves('success');
							batch_stub = sinonSandbox.stub(t, 'batch').resolves('success');
							scope = _.cloneDeep(validScope);
							scope.backwards = false;
							round = new Round(_.cloneDeep(scope), t);
							res = round.applyRound();
						});
					});

					it('query should be called', () => {
						return res.then(res => {
							expect(res).to.equal('success');
							expect(batch_stub.called).to.be.true;
						});
					});

					it('should call mergeAccountAndGet with proper args (apply rewards)', () => {
						var index = 0; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(scope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(scope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(scope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: scope.roundDelegates[index],
							balance: balancePerDelegate,
							u_balance: balancePerDelegate,
							blockId: scope.block.id,
							round: scope.round,
							fees: feesPerDelegate,
							rewards: scope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						forwardResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should not call mergeAccountAndGet another time (for apply remaining fees)', () => {
						expect(
							round.scope.modules.accounts.mergeAccountAndGet.callCount
						).to.equal(called);
					});

					it('should call insertRoundRewards with proper args', () => {
						expect(insertRoundRewards_stub).to.have.been.calledWith(
							validScope.block.timestamp,
							forwardResults[0].fees.toString(),
							forwardResults[0].rewards.toString(),
							validScope.round,
							forwardResults[0].publicKey
						);
					});
				});

				describe('backwards', () => {
					var called = 0;

					before(() => {
						round.scope.modules.accounts.mergeAccountAndGet.resetHistory();
						return db.task(t => {
							insertRoundRewards_stub = sinonSandbox
								.stub(t.rounds, 'insertRoundRewards')
								.resolves('success');
							batch_stub = sinonSandbox.stub(t, 'batch').resolves('success');
							scope = _.cloneDeep(validScope);
							scope.backwards = true;
							round = new Round(_.cloneDeep(scope), t);
							res = round.applyRound();
						});
					});

					it('query should be called', () => {
						return res.then(res => {
							expect(res).to.equal('success');
							expect(batch_stub.called).to.be.true;
						});
					});

					it('should call mergeAccountAndGet with proper args (apply rewards)', () => {
						var index = 0; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(validScope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(validScope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(validScope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: validScope.roundDelegates[index],
							balance: -balancePerDelegate,
							u_balance: -balancePerDelegate,
							blockId: validScope.block.id,
							round: validScope.round,
							fees: -feesPerDelegate,
							rewards: -validScope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						backwardsResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should not call mergeAccountAndGet another time (for apply remaining fees)', () => {
						expect(
							round.scope.modules.accounts.mergeAccountAndGet.callCount
						).to.equal(called);
					});

					it('should not call insertRoundRewards', () => {
						expect(insertRoundRewards_stub).to.have.not.been.called;
					});
				});

				describe('consistency checks for each delegate', () => {
					var result;

					before(() => {
						result = sumChanges(forwardResults, backwardsResults);
					});

					it('balance should sum to 0', () => {
						_.each(result, res => {
							expect(res.balance).to.equal(0);
						});
					});

					it('u_balance should sum to 0', () => {
						_.each(result, res => {
							expect(res.u_balance).to.equal(0);
						});
					});

					it('fees should sum to 0', () => {
						_.each(result, res => {
							expect(res.fees).to.equal(0);
						});
					});

					it('rewards should sum to 0', () => {
						_.each(result, res => {
							expect(res.rewards).to.equal(0);
						});
					});
				});
			});

			describe('when there are remaining fees', () => {
				var forwardResults = [];
				var backwardsResults = [];

				before(() => {
					validScope.roundDelegates = [genesisBlock.generatorPublicKey];
					validScope.roundFees = 100; // 0 LSK fee per delegate, 100 remaining fees
				});

				describe('forward', () => {
					var called = 0;

					before(() => {
						round.scope.modules.accounts.mergeAccountAndGet.resetHistory();
						return db.task(t => {
							insertRoundRewards_stub = sinonSandbox
								.stub(t.rounds, 'insertRoundRewards')
								.resolves('success');
							batch_stub = sinonSandbox.stub(t, 'batch').resolves('success');
							scope = _.cloneDeep(validScope);
							scope.backwards = false;
							round = new Round(_.cloneDeep(scope), t);
							res = round.applyRound();
						});
					});

					it('query should be called', () => {
						return res.then(res => {
							expect(res).to.equal('success');
							expect(batch_stub.called).to.be.true;
						});
					});

					it('should call mergeAccountAndGet with proper args (apply rewards)', () => {
						var index = 0; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(validScope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(validScope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(validScope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: validScope.roundDelegates[index],
							balance: balancePerDelegate,
							u_balance: balancePerDelegate,
							blockId: validScope.block.id,
							round: validScope.round,
							fees: feesPerDelegate,
							rewards: validScope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						forwardResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should call mergeAccountAndGet with proper args (fees)', () => {
						var index = 0; // Delegate index on list
						var feesPerDelegate = new bignum(
							validScope.roundFees.toPrecision(15)
						)
							.dividedBy(slots.delegates)
							.floor();
						var remainingFees = Number(
							new bignum(validScope.roundFees.toPrecision(15))
								.minus(feesPerDelegate.times(slots.delegates))
								.toFixed()
						);

						var args = {
							publicKey: validScope.roundDelegates[index], // Remaining fees are applied to last delegate of round
							balance: remainingFees,
							u_balance: remainingFees,
							blockId: validScope.block.id,
							round: validScope.round,
							fees: remainingFees,
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						forwardResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should not call mergeAccountAndGet another time (completed)', () => {
						expect(
							round.scope.modules.accounts.mergeAccountAndGet.callCount
						).to.equal(called);
					});

					it('should call insertRoundRewards with proper args', () => {
						expect(insertRoundRewards_stub).to.have.been.calledWith(
							validScope.block.timestamp,
							(forwardResults[0].fees + forwardResults[1].fees).toString(),
							forwardResults[0].rewards.toString(),
							validScope.round,
							forwardResults[0].publicKey
						);
					});
				});

				describe('backwards', () => {
					var called = 0;

					before(() => {
						round.scope.modules.accounts.mergeAccountAndGet.resetHistory();
						return db.task(t => {
							insertRoundRewards_stub = sinonSandbox
								.stub(t.rounds, 'insertRoundRewards')
								.resolves('success');
							batch_stub = sinonSandbox.stub(t, 'batch').resolves('success');
							scope = _.cloneDeep(validScope);
							scope.backwards = true;
							round = new Round(_.cloneDeep(scope), t);
							res = round.applyRound();
						});
					});

					it('query should be called', () => {
						return res.then(res => {
							expect(res).to.equal('success');
							expect(batch_stub.called).to.be.true;
						});
					});

					it('should call mergeAccountAndGet with proper args (apply rewards)', () => {
						var index = 0; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(validScope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(validScope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(validScope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: validScope.roundDelegates[index],
							balance: -balancePerDelegate,
							u_balance: -balancePerDelegate,
							blockId: validScope.block.id,
							round: validScope.round,
							fees: -feesPerDelegate,
							rewards: -validScope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						forwardResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should call mergeAccountAndGet with proper args (fees)', () => {
						var index = 0; // Delegate index on list
						var feesPerDelegate = new bignum(
							validScope.roundFees.toPrecision(15)
						)
							.dividedBy(slots.delegates)
							.floor();
						var remainingFees = Number(
							new bignum(validScope.roundFees.toPrecision(15))
								.minus(feesPerDelegate.times(slots.delegates))
								.toFixed()
						);

						var args = {
							publicKey: validScope.roundDelegates[index], // Remaining fees are applied to last delegate of round
							balance: -remainingFees,
							u_balance: -remainingFees,
							blockId: validScope.block.id,
							round: validScope.round,
							fees: -remainingFees,
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						backwardsResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should not call mergeAccountAndGet another time (completed)', () => {
						expect(
							round.scope.modules.accounts.mergeAccountAndGet.callCount
						).to.equal(called);
					});

					it('should not call insertRoundRewards', () => {
						expect(insertRoundRewards_stub).to.have.not.been.called;
					});
				});

				describe('consistency checks for each delegate', () => {
					var result;

					before(() => {
						result = sumChanges(forwardResults, backwardsResults);
					});

					it('balance should sum to 0', () => {
						_.each(result, res => {
							expect(res.balance).to.equal(0);
						});
					});

					it('u_balance should sum to 0', () => {
						_.each(result, res => {
							expect(res.u_balance).to.equal(0);
						});
					});

					it('fees should sum to 0', () => {
						_.each(result, res => {
							expect(res.fees).to.equal(0);
						});
					});

					it('rewards should sum to 0', () => {
						_.each(result, res => {
							expect(res.rewards).to.equal(0);
						});
					});
				});
			});
		});

		describe('with 3 delegates', () => {
			describe('when there are no remaining fees', () => {
				var forwardResults = [];
				var backwardsResults = [];

				before(() => {
					validScope.roundDelegates = [
						'6a01c4b86f4519ec9fa5c3288ae20e2e7a58822ebe891fb81e839588b95b242a',
						'968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b',
						'380b952cd92f11257b71cce73f51df5e0a258e54f60bb82bccd2ba8b4dff2ec9',
					];
					validScope.roundRewards = [1, 2, 3];
					validScope.roundFees = slots.delegates; // 1 LSK fee per delegate, no remaining fees
				});

				describe('forward', () => {
					var called = 0;

					before(() => {
						round.scope.modules.accounts.mergeAccountAndGet.resetHistory();
						return db.task(t => {
							insertRoundRewards_stub = sinonSandbox
								.stub(t.rounds, 'insertRoundRewards')
								.resolves('success');
							batch_stub = sinonSandbox.stub(t, 'batch').resolves('success');
							scope = _.cloneDeep(validScope);
							scope.backwards = false;
							round = new Round(_.cloneDeep(scope), t);
							res = round.applyRound();
						});
					});

					it('query should be called', () => {
						return res.then(res => {
							expect(res).to.equal('success');
							expect(batch_stub.called).to.be.true;
						});
					});

					it('should call mergeAccountAndGet with proper args (rewards) - 1st delegate', () => {
						var index = 0; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(scope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(scope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(scope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: scope.roundDelegates[index],
							balance: balancePerDelegate,
							u_balance: balancePerDelegate,
							blockId: scope.block.id,
							round: scope.round,
							fees: feesPerDelegate,
							rewards: scope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						forwardResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should call mergeAccountAndGet with proper args (rewards) - 2nd delegate', () => {
						var index = 1; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(scope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(scope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(scope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: scope.roundDelegates[index],
							balance: balancePerDelegate,
							u_balance: balancePerDelegate,
							blockId: scope.block.id,
							round: scope.round,
							fees: feesPerDelegate,
							rewards: scope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						forwardResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should call mergeAccountAndGet with proper args (rewards) - 3th delegate', () => {
						var index = 2; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(scope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(scope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(scope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: scope.roundDelegates[index],
							balance: balancePerDelegate,
							u_balance: balancePerDelegate,
							blockId: scope.block.id,
							round: scope.round,
							fees: feesPerDelegate,
							rewards: scope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						forwardResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should not call mergeAccountAndGet another time (for applying remaining fees)', () => {
						expect(
							round.scope.modules.accounts.mergeAccountAndGet.callCount
						).to.equal(called);
					});

					it('should call insertRoundRewards with proper args', () => {
						expect(insertRoundRewards_stub).to.have.been.calledWith(
							validScope.block.timestamp,
							forwardResults[0].fees.toString(),
							forwardResults[0].rewards.toString(),
							validScope.round,
							forwardResults[0].publicKey
						);
						expect(insertRoundRewards_stub).to.have.been.calledWith(
							validScope.block.timestamp,
							forwardResults[1].fees.toString(),
							forwardResults[1].rewards.toString(),
							validScope.round,
							forwardResults[1].publicKey
						);
						expect(insertRoundRewards_stub).to.have.been.calledWith(
							validScope.block.timestamp,
							forwardResults[2].fees.toString(),
							forwardResults[2].rewards.toString(),
							validScope.round,
							forwardResults[2].publicKey
						);
					});
				});

				describe('backwards', () => {
					var called = 0;

					before(() => {
						round.scope.modules.accounts.mergeAccountAndGet.resetHistory();
						return db.task(t => {
							insertRoundRewards_stub = sinonSandbox
								.stub(t.rounds, 'insertRoundRewards')
								.resolves('success');
							batch_stub = sinonSandbox.stub(t, 'batch').resolves('success');
							scope = _.cloneDeep(validScope);
							scope.backwards = true;
							round = new Round(_.cloneDeep(scope), t);
							res = round.applyRound();
						});
					});

					it('query should be called', () => {
						return res.then(res => {
							expect(res).to.equal('success');
							expect(batch_stub.called).to.be.true;
						});
					});

					it('should call mergeAccountAndGet with proper args (rewards) - 1st delegate', () => {
						var index = 2; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(scope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(scope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(scope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: scope.roundDelegates[index],
							balance: -balancePerDelegate,
							u_balance: -balancePerDelegate,
							blockId: scope.block.id,
							round: scope.round,
							fees: -feesPerDelegate,
							rewards: -scope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						backwardsResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should call mergeAccountAndGet with proper args (rewards) - 2nd delegate', () => {
						var index = 1; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(scope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(scope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(scope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: scope.roundDelegates[index],
							balance: -balancePerDelegate,
							u_balance: -balancePerDelegate,
							blockId: scope.block.id,
							round: scope.round,
							fees: -feesPerDelegate,
							rewards: -scope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						backwardsResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should call mergeAccountAndGet with proper args (rewards) - 3th delegate', () => {
						var index = 0; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(scope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(scope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(scope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: scope.roundDelegates[index],
							balance: -balancePerDelegate,
							u_balance: -balancePerDelegate,
							blockId: scope.block.id,
							round: scope.round,
							fees: -feesPerDelegate,
							rewards: -scope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						backwardsResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should not call mergeAccountAndGet another time (for applying remaining fees)', () => {
						expect(
							round.scope.modules.accounts.mergeAccountAndGet.callCount
						).to.equal(called);
					});

					it('should not call insertRoundRewards', () => {
						expect(insertRoundRewards_stub).to.have.not.been.called;
					});
				});

				describe('consistency checks for each delegate', () => {
					var result;

					before(() => {
						result = sumChanges(forwardResults, backwardsResults);
					});

					it('balance should sum to 0', () => {
						_.each(result, res => {
							expect(res.balance).to.equal(0);
						});
					});

					it('u_balance should sum to 0', () => {
						_.each(result, res => {
							expect(res.u_balance).to.equal(0);
						});
					});

					it('fees should sum to 0', () => {
						_.each(result, res => {
							expect(res.fees).to.equal(0);
						});
					});

					it('rewards should sum to 0', () => {
						_.each(result, res => {
							expect(res.rewards).to.equal(0);
						});
					});
				});
			});

			describe('when there are remaining fees', () => {
				var forwardResults = [];
				var backwardsResults = [];

				before(() => {
					validScope.roundDelegates = [
						'6a01c4b86f4519ec9fa5c3288ae20e2e7a58822ebe891fb81e839588b95b242a',
						'968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b',
						'380b952cd92f11257b71cce73f51df5e0a258e54f60bb82bccd2ba8b4dff2ec9',
					];
					validScope.roundRewards = [1, 2, 3];
					validScope.roundFees = 1000; // 9 LSK fee per delegate, 91 remaining fees
				});

				describe('forward', () => {
					var called = 0;

					before(() => {
						round.scope.modules.accounts.mergeAccountAndGet.resetHistory();
						return db.task(t => {
							insertRoundRewards_stub = sinonSandbox
								.stub(t.rounds, 'insertRoundRewards')
								.resolves('success');
							batch_stub = sinonSandbox.stub(t, 'batch').resolves('success');
							scope = _.cloneDeep(validScope);
							scope.backwards = false;
							round = new Round(_.cloneDeep(scope), t);
							res = round.applyRound();
						});
					});

					it('query should be called', () => {
						return res.then(res => {
							expect(res).to.equal('success');
							expect(batch_stub.called).to.be.true;
						});
					});

					it('should call mergeAccountAndGet with proper args (rewards) - 1st delegate', () => {
						var index = 0; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(scope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(scope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(scope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: scope.roundDelegates[index],
							balance: balancePerDelegate,
							u_balance: balancePerDelegate,
							blockId: scope.block.id,
							round: scope.round,
							fees: feesPerDelegate,
							rewards: scope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						forwardResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should call mergeAccountAndGet with proper args (rewards) - 2nd delegate', () => {
						var index = 1; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(scope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(scope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(scope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: scope.roundDelegates[index],
							balance: balancePerDelegate,
							u_balance: balancePerDelegate,
							blockId: scope.block.id,
							round: scope.round,
							fees: feesPerDelegate,
							rewards: scope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						forwardResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should call mergeAccountAndGet with proper args (rewards) - 3th delegate', () => {
						var index = 2; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(scope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(scope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(scope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: scope.roundDelegates[index],
							balance: balancePerDelegate,
							u_balance: balancePerDelegate,
							blockId: scope.block.id,
							round: scope.round,
							fees: feesPerDelegate,
							rewards: scope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						forwardResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should call mergeAccountAndGet with proper args (fees)', () => {
						var index = 2; // Delegate index on list
						var feesPerDelegate = new bignum(scope.roundFees.toPrecision(15))
							.dividedBy(slots.delegates)
							.floor();
						var remainingFees = Number(
							new bignum(scope.roundFees.toPrecision(15))
								.minus(feesPerDelegate.times(slots.delegates))
								.toFixed()
						);

						var args = {
							publicKey: scope.roundDelegates[index], // Remaining fees are applied to last delegate of round
							balance: remainingFees,
							u_balance: remainingFees,
							blockId: scope.block.id,
							round: scope.round,
							fees: remainingFees,
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						forwardResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should not call mergeAccountAndGet another time (completed)', () => {
						expect(
							round.scope.modules.accounts.mergeAccountAndGet.callCount
						).to.equal(called);
					});

					it('should call insertRoundRewards with proper args', () => {
						expect(insertRoundRewards_stub).to.have.been.calledWith(
							validScope.block.timestamp,
							forwardResults[0].fees.toString(),
							forwardResults[0].rewards.toString(),
							validScope.round,
							forwardResults[0].publicKey
						);
						expect(insertRoundRewards_stub).to.have.been.calledWith(
							validScope.block.timestamp,
							forwardResults[1].fees.toString(),
							forwardResults[1].rewards.toString(),
							validScope.round,
							forwardResults[1].publicKey
						);
						expect(insertRoundRewards_stub).to.have.been.calledWith(
							validScope.block.timestamp,
							(forwardResults[2].fees + forwardResults[3].fees).toString(),
							forwardResults[2].rewards.toString(),
							validScope.round,
							forwardResults[2].publicKey
						);
					});
				});

				describe('backwards', () => {
					var called = 0;

					before(() => {
						round.scope.modules.accounts.mergeAccountAndGet.resetHistory();
						return db.task(t => {
							insertRoundRewards_stub = sinonSandbox
								.stub(t.rounds, 'insertRoundRewards')
								.resolves('success');
							batch_stub = sinonSandbox.stub(t, 'batch').resolves('success');
							scope = _.cloneDeep(validScope);
							scope.backwards = true;
							round = new Round(_.cloneDeep(scope), t);
							res = round.applyRound();
						});
					});

					it('query should be called', () => {
						return res.then(res => {
							expect(res).to.equal('success');
							expect(batch_stub.called).to.be.true;
						});
					});

					it('should call mergeAccountAndGet with proper args (rewards) - 1st delegate', () => {
						var index = 2; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(scope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(scope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(scope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: scope.roundDelegates[index],
							balance: -balancePerDelegate,
							u_balance: -balancePerDelegate,
							blockId: scope.block.id,
							round: scope.round,
							fees: -feesPerDelegate,
							rewards: -scope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						backwardsResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should call mergeAccountAndGet with proper args (rewards) - 2nd delegate', () => {
						var index = 1; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(scope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(scope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(scope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: scope.roundDelegates[index],
							balance: -balancePerDelegate,
							u_balance: -balancePerDelegate,
							blockId: scope.block.id,
							round: scope.round,
							fees: -feesPerDelegate,
							rewards: -scope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						backwardsResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should call mergeAccountAndGet with proper args (rewards) - 3th delegate', () => {
						var index = 0; // Delegate index on list
						var balancePerDelegate = Number(
							new bignum(scope.roundRewards[index].toPrecision(15))
								.plus(
									new bignum(scope.roundFees.toPrecision(15))
										.dividedBy(slots.delegates)
										.floor()
								)
								.toFixed()
						);
						var feesPerDelegate = Number(
							new bignum(scope.roundFees.toPrecision(15))
								.dividedBy(slots.delegates)
								.floor()
								.toFixed()
						);
						var args = {
							publicKey: scope.roundDelegates[index],
							balance: -balancePerDelegate,
							u_balance: -balancePerDelegate,
							blockId: scope.block.id,
							round: scope.round,
							fees: -feesPerDelegate,
							rewards: -scope.roundRewards[index],
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						backwardsResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should call mergeAccountAndGet with proper args (fees)', () => {
						var index = 2; // Delegate index on list
						var feesPerDelegate = new bignum(scope.roundFees.toPrecision(15))
							.dividedBy(slots.delegates)
							.floor();
						var remainingFees = Number(
							new bignum(scope.roundFees.toPrecision(15))
								.minus(feesPerDelegate.times(slots.delegates))
								.toFixed()
						);

						var args = {
							publicKey: scope.roundDelegates[index], // Remaining fees are applied to last delegate of round
							balance: -remainingFees,
							u_balance: -remainingFees,
							blockId: scope.block.id,
							round: scope.round,
							fees: -remainingFees,
						};
						var result =
							round.scope.modules.accounts.mergeAccountAndGet.args[called][0];
						forwardResults.push(result);
						expect(result).to.deep.equal(args);
						called++;
					});

					it('should not call mergeAccountAndGet another time (completed)', () => {
						expect(
							round.scope.modules.accounts.mergeAccountAndGet.callCount
						).to.equal(called);
					});

					it('should not call insertRoundRewards', () => {
						expect(insertRoundRewards_stub).to.have.not.been.called;
					});
				});

				describe('consistency checks for each delegate', () => {
					var result;

					before(() => {
						result = sumChanges(forwardResults, backwardsResults);
					});

					it('balance should sum to 0', () => {
						_.each(result, res => {
							expect(res.balance).to.equal(0);
						});
					});

					it('u_balance should sum to 0', () => {
						_.each(result, res => {
							expect(res.u_balance).to.equal(0);
						});
					});

					it('fees should sum to 0', () => {
						_.each(result, res => {
							expect(res.fees).to.equal(0);
						});
					});

					it('rewards should sum to 0', () => {
						_.each(result, res => {
							expect(res.rewards).to.equal(0);
						});
					});
				});
			});
		});
	});

	describe('land', () => {
		var batch_stub; // eslint-disable-line no-unused-vars
		var roundOutsiders_stub;
		var updateVotes_stub;
		var getVotes_stub;
		var flush_stub;
		var res;
		var scope;

		before(() => {
			scope = _.cloneDeep(validScope);
			// Init required properties
			scope.roundOutsiders = ['abc'];
			scope.library.db = db;
			scope.modules.accounts.generateAddressByPublicKey = function() {
				return delegate.address;
			};

			var delegate = {
				amount: 10000,
				delegate:
					'6a01c4b86f4519ec9fa5c3288ae20e2e7a58822ebe891fb81e839588b95b242a',
				address: '16010222169256538112L',
			};

			round.scope.modules.accounts.mergeAccountAndGet.resetHistory();
			return db.task(t => {
				// Init stubs
				batch_stub = sinonSandbox.stub(t, 'none').resolves();
				roundOutsiders_stub = sinonSandbox
					.stub(t.rounds, 'updateMissedBlocks')
					.resolves();
				getVotes_stub = sinonSandbox
					.stub(t.rounds, 'getVotes')
					.resolves([delegate]);
				updateVotes_stub = sinonSandbox
					.stub(t.rounds, 'updateVotes')
					.resolves('QUERY');
				flush_stub = sinonSandbox.stub(t.rounds, 'flush').resolves();

				round = new Round(_.cloneDeep(scope), t);
				res = round.land();
			});
		});

		it('should return promise', () => {
			expect(isPromise(res)).to.be.true;
		});

		it('query getVotes should be called twice', () => {
			// 2x updateVotes which calls 1x getVotes
			expect(getVotes_stub.callCount).to.equal(2);
		});

		it('query updateVotes should be called twice', () => {
			expect(updateVotes_stub.callCount).to.equal(2);
		});

		it('query updateMissedBlocks should be called once', () => {
			expect(roundOutsiders_stub.callCount).to.equal(1);
		});

		it('query flushRound should be called twice', () => {
			expect(flush_stub.callCount).to.equal(2);
		});

		it('modules.accounts.mergeAccountAndGet should be called 4 times', () => {
			// 3x delegates + 1x remaining fees
			expect(
				round.scope.modules.accounts.mergeAccountAndGet.callCount
			).to.equal(4);
		});
	});

	describe('backwardLand', () => {
		var batch_stub; // eslint-disable-line no-unused-vars
		var roundOutsiders_stub;
		var updateVotes_stub;
		var getVotes_stub;
		var restoreRoundSnapshot_stub;
		var restoreVotesSnapshot_stub;
		var deleteRoundRewards_stub;
		var flush_stub;
		var res;
		var scope;

		before(() => {
			scope = _.cloneDeep(validScope);
			// Init required properties
			scope.roundOutsiders = ['abc'];
			scope.library.db = db;
			scope.modules.accounts.generateAddressByPublicKey = function() {
				return delegate.address;
			};

			var delegate = {
				amount: 10000,
				delegate:
					'6a01c4b86f4519ec9fa5c3288ae20e2e7a58822ebe891fb81e839588b95b242a',
				address: '16010222169256538112L',
			};

			round.scope.modules.accounts.mergeAccountAndGet.resetHistory();
			return db.task(t => {
				// Init stubs
				batch_stub = sinonSandbox.stub(t, 'none').resolves();
				roundOutsiders_stub = sinonSandbox
					.stub(t.rounds, 'updateMissedBlocks')
					.resolves();
				getVotes_stub = sinonSandbox
					.stub(t.rounds, 'getVotes')
					.resolves([delegate]);
				updateVotes_stub = sinonSandbox
					.stub(t.rounds, 'updateVotes')
					.resolves('QUERY');
				flush_stub = sinonSandbox.stub(t.rounds, 'flush').resolves();
				restoreRoundSnapshot_stub = sinonSandbox
					.stub(t.rounds, 'restoreRoundSnapshot')
					.resolves();
				restoreVotesSnapshot_stub = sinonSandbox
					.stub(t.rounds, 'restoreVotesSnapshot')
					.resolves();
				deleteRoundRewards_stub = sinonSandbox
					.stub(t.rounds, 'deleteRoundRewards')
					.resolves();

				round = new Round(_.cloneDeep(scope), t);
				res = round.backwardLand();
			});
		});

		it('should return promise', () => {
			expect(isPromise(res)).to.be.true;
		});

		it('query getVotes should be called twice', () => {
			// 2x updateVotes which calls 1x getVotes
			expect(getVotes_stub.callCount).to.equal(2);
		});

		it('query updateVotes should be called twice', () => {
			expect(updateVotes_stub.callCount).to.equal(2);
		});

		it('query updateMissedBlocks should be called once', () => {
			expect(roundOutsiders_stub.callCount).to.equal(1);
		});

		it('query flushRound should be called twice', () => {
			expect(flush_stub.callCount).to.equal(2);
		});

		it('modules.accounts.mergeAccountAndGet should be called 4 times', () => {
			// 3x delegates + 1x remaining fees
			expect(
				round.scope.modules.accounts.mergeAccountAndGet.callCount
			).to.equal(4);
		});

		it('query restoreRoundSnapshot should be called once', () => {
			expect(restoreRoundSnapshot_stub.callCount).to.equal(1);
		});

		it('query restoreVotesSnapshot should be called once', () => {
			expect(restoreVotesSnapshot_stub.callCount).to.equal(1);
		});

		it('query deleteRoundRewards should be called once', () => {
			expect(deleteRoundRewards_stub.callCount).to.equal(1);
		});
	});
});
