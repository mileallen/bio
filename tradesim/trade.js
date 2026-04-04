// Firebase configuration - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyCtm5IjFK84u_YYcilEDEzBcC_yDnMXNRk",
    authDomain: "mecon-trade.firebaseapp.com",
    databaseURL: "https://mecon-trade-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mecon-trade",
    storageBucket: "mecon-trade.firebasestorage.app",
    messagingSenderId: "395571324845",
    appId: "1:395571324845:web:22b457d7cfcf34f2ed2324"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const sessionId = 'default';

function tradeApp() {
    return {
        isBrief: false,
        studentName: '',
        currentStudent: null,
        currentStudentId: null,
        students: {},
        items: {},
        bids: {},
        myBids: {},
        phase: 'waiting',
        studentCounter: 0,
        showItemModal: false,
        itemInputs: Array(30).fill(''),
        masterItems: [],
        isDebrief: false,
        debriefData: null,
        initialItemOwners: {},

        init() {
            this.isBrief = window.location.hash === '#profw';
            this.isDebrief = window.location.hash === '#debrief';

            // Restore student session from localStorage
            if (!this.isBrief && !this.isDebrief) {
                const savedStudentId = localStorage.getItem('currentStudentId');
                if (savedStudentId) {
                    this.currentStudentId = savedStudentId;
                }
            }

            if (!this.isDebrief) {
                db.ref(`sessions/${sessionId}/students`).on('value', (snapshot) => {
                    this.students = snapshot.val() || {};
                    if (this.currentStudentId && this.students[this.currentStudentId]) {
                        this.currentStudent = this.students[this.currentStudentId];
                    }
                }
                );

                db.ref(`sessions/${sessionId}/items`).on('value', (snapshot) => {
                    this.items = snapshot.val() || {};
                }
                );

                db.ref(`sessions/${sessionId}/bids`).on('value', (snapshot) => {
                    this.bids = snapshot.val() || {};
                    this.updateMyBids();
                }
                );

                db.ref(`sessions/${sessionId}/phase`).on('value', (snapshot) => {
                    this.phase = snapshot.val() || 'waiting';
                }
                );

                db.ref(`sessions/${sessionId}/studentCounter`).on('value', (snapshot) => {
                    this.studentCounter = snapshot.val() || 0;
                }
                );

                db.ref(`masterItems`).on('value', (snapshot) => {
                    const items = snapshot.val() || [];
                    this.masterItems = items;
                    this.itemInputs = [...items];
                    while (this.itemInputs.length < 30) {
                        this.itemInputs.push('');
                    }
                }
                );
            }
        },

        joinSession() {
            if (!this.studentName.trim())
                return;

            const counterRef = db.ref(`sessions/${sessionId}/studentCounter`);
            counterRef.transaction( (current) => {
                return (current || 0) + 1;
            }
            , (error, committed, snapshot) => {
                if (committed) {
                    const studentNumber = snapshot.val();
                    const studentId = `student_${studentNumber}`;
                    this.currentStudentId = studentId;

                    // Save to localStorage - enable in class
                    localStorage.setItem('currentStudentId', studentId);

                    db.ref(`sessions/${sessionId}/students/${studentId}`).set({
                        id: studentId,
                        name: this.studentName.trim(),
                        budget: 100,
                        items: [],
                        joinedAt: Date.now()
                    });

                    this.currentStudent = {
                        id: studentId,
                        name: this.studentName.trim(),
                        budget: 100,
                        items: [],
                        joinedAt: Date.now()
                    };
                }
            }
            );
        },

        saveItemList() {
            const items = this.itemInputs.filter(item => item.trim() !== '');
            db.ref(`masterItems`).set(items);
            this.showItemModal = false;
        },

        ejectStudent(studentId) {
            if (confirm('Are you sure you want to eject this student?')) {
                db.ref(`sessions/${sessionId}/students/${studentId}`).remove();

                const updates = {};
                Object.keys(this.items).forEach(itemId => {
                    if (this.items[itemId].owner === studentId) {
                        updates[`items/${itemId}`] = null;
                    }
                }
                );

                Object.keys(this.bids).forEach(itemId => {
                    if (this.bids[itemId] && this.bids[itemId][studentId]) {
                        updates[`bids/${itemId}/${studentId}`] = null;
                    }
                }
                );

                if (Object.keys(updates).length > 0) {
                    db.ref(`sessions/${sessionId}`).update(updates);
                }
            }
        },

        allocateItems() {
            const studentIds = Object.keys(this.students);
            if (studentIds.length === 0 || this.masterItems.length === 0)
                return;

            const itemsToAllocate = [...this.masterItems].sort( () => Math.random() - 0.5);
            let itemIndex = 0;

            studentIds.forEach(studentId => {
                const item1 = itemsToAllocate[itemIndex % itemsToAllocate.length];
                const item2 = itemsToAllocate[(itemIndex + 1) % itemsToAllocate.length];
                itemIndex += 2;

                const item1Ref = db.ref(`sessions/${sessionId}/items`).push();
                const item2Ref = db.ref(`sessions/${sessionId}/items`).push();

                item1Ref.set({
                    name: item1,
                    initialOwner: studentId,
                    owner: studentId,
                    finalOwner: "",
                    price: null,
                    value: null,
                    traded: false,
                    highestBid: null,
                    highestBidder: null
                });

                item2Ref.set({
                    name: item2,
                    initialOwner: studentId,
                    owner: studentId,
                    finalOwner: "",
                    price: null,
                    value: null,
                    traded: false,
                    highestBid: null,
                    highestBidder: null
                });

                db.ref(`sessions/${sessionId}/students/${studentId}/items`).set([item1Ref.key, item2Ref.key]);
            }
            );

            db.ref(`sessions/${sessionId}/phase`).set('pricing');
        },

        submitPrice(itemId, price) {
            const priceNum = parseFloat(price);
            if (isNaN(priceNum) || priceNum <= 0) {
                alert('Please enter a valid price greater than 0');
                return;
            }

            // Check total pricing constraint
            const myItems = this.currentStudent.items || [];
            const otherItemId = myItems.find(id => id !== itemId);
            const otherItem = this.items[otherItemId];

            if (otherItem && otherItem.price) {
                // Other item already priced, check if total = 100
                if (priceNum + otherItem.price !== 100) {
                    alert(`Total price of your two items must equal €100. Your other item is priced at €${otherItem.price}, so this item must be €${100 - otherItem.price}`);
                    return;
                }
            } else if (myItems.length === 2) {
                // This is the first item being priced, just check it's <= 100
                if (priceNum >= 100) {
                    alert('Price must be less than €100 to leave room for your second item');
                    return;
                }
            }

            // Set both price and initial value
            db.ref(`sessions/${sessionId}/items/${itemId}`).update({
                price: priceNum,
                value: priceNum
            });
        },

        broadcastPrices() {
            db.ref(`sessions/${sessionId}/phase`).set('bidding');
        },

        submitBid(itemId, amount) {
            const bidAmount = parseFloat(amount);
            if (isNaN(bidAmount) || bidAmount <= 0) {
                alert('Please enter a valid bid amount');
                return;
            }

            if (this.getBidCount() >= 2) {
                alert('You can only bid on 2 items');
                return;
            }

            const totalBids = Object.values(this.myBids).reduce( (sum, bid) => sum + bid.amount, 0);
            if (totalBids + bidAmount > 100) {
                alert('Total bids cannot exceed €100');
                return;
            }

            db.ref(`sessions/${sessionId}/bids/${itemId}/${this.currentStudentId}`).set({
                amount: bidAmount,
                timestamp: Date.now()
            });
        },

        publishBids() {
            db.ref(`sessions/${sessionId}/phase`).set('bids_published');
        },

        executeTrades() {
            const updates = {};
            const studentItemChanges = {};
            const studentBudgetChanges = {};

            // Initialize tracking objects
            Object.keys(this.students).forEach(studentId => {
                studentItemChanges[studentId] = [...(this.students[studentId].items || [])];
                studentBudgetChanges[studentId] = this.students[studentId].budget || 100;
            }
            );

            Object.keys(this.items).forEach(itemId => {
                const item = this.items[itemId];
                const itemBids = this.bids[itemId];

                if (itemBids && Object.keys(itemBids).length > 0) {
                    const winner = this.getWinningBid(itemId);
                    const winnerId = winner.studentId;
                    const winAmount = winner.amount;

                    // Only execute trade if winning bid meets or exceeds the price
                    if (winner && winner.amount >= item.price) {

                        const sellerId = item.owner;

                        // Don't allow self-trading
                        if (winnerId === sellerId)
                            return;

                        // Update item ownership tracking
                        studentItemChanges[sellerId] = studentItemChanges[sellerId].filter(id => id !== itemId);
                        studentItemChanges[winnerId].push(itemId);

                        // Update budget tracking
                        studentBudgetChanges[winnerId] -= winAmount;
                        studentBudgetChanges[sellerId] += winAmount;

                        // Update item owner and value
                        updates[`items/${itemId}/owner`] = winnerId;
                        updates[`items/${itemId}/finalOwner`] = winnerId;
                        updates[`items/${itemId}/value`] = winAmount;

                        updates[`items/${itemId}/traded`] = true;
                        //item.traded = true;
                    }
                        // for items that don't trade
                    else {
                        updates[`items/${itemId}/finalOwner`] = item.initialOwner;
                    }
                    updates[`items/${itemId}/highestBid`] = winAmount ;
                    updates[`items/${itemId}/highestBidder`] = winnerId ;
                }
            }
            );

            // Apply all student changes
            Object.keys(studentItemChanges).forEach(studentId => {
                updates[`students/${studentId}/items`] = studentItemChanges[studentId];
                updates[`students/${studentId}/budget`] = studentBudgetChanges[studentId];
            }
            );

            updates['phase'] = 'complete';

            db.ref(`sessions/${sessionId}`).update(updates);
        },

        resetSession() {
            if (confirm('Are you sure you want to reset the session? This will clear students, items, and bids but preserve the item list.')) {
                db.ref(`sessions/${sessionId}`).remove();
            }
        },

        downloadSessionData() {
            const sessionData = {
                sessionId: sessionId,
                exportedAt: new Date().toISOString(),
                phase: this.phase,
                students: this.students,
                items: this.items,
                bids: this.bids,
                masterItems: this.masterItems,
                summary: this.generateSummary()
            };

            const dataStr = JSON.stringify(sessionData, null, 2);
            const dataBlob = new Blob([dataStr],{
                type: 'application/json'
            });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `trade-simulation-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);
        },

        generateSummary() {
            const summary = {
                totalStudents: Object.keys(this.students).length,
                totalItems: Object.keys(this.items).length,
                totalBids: Object.values(this.bids).reduce( (sum, itemBids) => sum + Object.keys(itemBids).length, 0),
                trades: []
            };

            if (this.phase === 'complete' || this.phase === 'bids_published') {
                Object.keys(this.items).forEach(itemId => {
                    const item = this.items[itemId];
                    const itemBids = this.bids[itemId];

                    if (itemBids && Object.keys(itemBids).length > 0) {
                        const winner = this.getWinningBid(itemId);
                        if (winner && winner.amount >= item.price) {
                            summary.trades.push({
                                item: item.name,
                                itemId: item.itemId,
                                seller: this.students[item.initialOwner]?.name,
                                sellerId: item.initialOwner,
                                buyer: this.students[winner.studentId]?.name,
                                buyerId: winner.studentId,
                                price: winner.amount,
                                timestamp: winner.timestamp
                            });
                        }
                    }
                }
                );
            }

            summary.studentPerformance = Object.keys(this.students).map(studentId => {
                const student = this.students[studentId];
                return {
                    id: studentId,
                    name: student.name,
                    finalBudget: student.budget,
                    budgetChange: student.budget - 100,
                    itemCount: student.items?.length || 0
                };
            }
            );

            return summary;
        },

        getPricedItemsCount() {
            return Object.values(this.items).filter(item => item.price !== null && item.price !== undefined).length;
        },

        getStudentsWhoBid() {
            const studentIds = new Set();
            Object.values(this.bids).forEach(itemBids => {
                Object.keys(itemBids).forEach(sid => studentIds.add(sid));
            }
            );
            return studentIds.size;
        },

        getBidCount() {
            return Object.keys(this.myBids).length;
        },

        updateMyBids() {
            this.myBids = {};
            Object.keys(this.bids).forEach(itemId => {
                if (this.bids[itemId] && this.bids[itemId][this.currentStudentId]) {
                    this.myBids[itemId] = this.bids[itemId][this.currentStudentId];
                }
            }
            );
        },

        getWinningBid(itemId) {
            const itemBids = this.bids[itemId];
            if (!itemBids || Object.keys(itemBids).length === 0)
                return null;

            let winner = null;
            let maxBid = -1;
            let earliestTime = Infinity;

            Object.keys(itemBids).forEach(studentId => {
                const bid = itemBids[studentId];
                if (bid.amount > maxBid || (bid.amount === maxBid && bid.timestamp < earliestTime)) {
                    maxBid = bid.amount;
                    earliestTime = bid.timestamp;
                    winner = {
                        studentId,
                        amount: bid.amount,
                        timestamp: bid.timestamp
                    };
                }
            }
            );

            return winner;
        },

        getPhaseText() {
            const phases = {
                'waiting': 'Waiting for Items',
                'pricing': 'Set Your Prices',
                'bidding': 'Place Your Bids',
                'bids_published': 'Bids Published',
                'complete': 'Trading Complete'
            };
            return phases[this.phase] || this.phase;
        },

        getTotalAssets() {
            if (!this.currentStudent || !this.currentStudent.items)
                return 100;

            const itemsValue = this.currentStudent.items.reduce( (total, itemId) => {
                const item = this.items[itemId];
                return total + (item && item.value ? item.value : 0);
            }
            , 0);

            return (this.currentStudent.budget || 100) + itemsValue;
        },

        // Debrief functions
        loadDebriefData(event) {
            const file = event.target.files[0];
            if (!file)
                return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    this.debriefData = JSON.parse(e.target.result);
                    this.initialItemOwners = {};
                    Object.keys(this.debriefData.items).forEach(itemId => {
                        const item = this.debriefData.items[itemId];
                        this.initialItemOwners[itemId] = item.initialOwner;
                    }
                    );
                } catch (error) {
                    alert('Error loading file. Please ensure it is a valid JSON file.');
                }
            }
            ;
            reader.readAsText(file);
        },

        getInitialItems(studentId) {
            if (!this.debriefData)
                return 0;
            let count = 0;
            Object.keys(this.initialItemOwners).forEach(itemId => {
                if (this.initialItemOwners[itemId] === studentId) {
                    count++;
                }
            }
            );
            return count;
        },

        getFinalAssets(studentId) {
            if (!this.debriefData)
                return 0;
            const student = this.debriefData.students[studentId];
            if (!student)
                return 0;

            const budget = student.budget || 0;
            const itemsValue = (student.items || []).reduce( (total, itemId) => {
                const item = this.debriefData.items[itemId];
                return total + (item && item.value ? item.value : 0);
            }
            , 0);

            return budget + itemsValue;
        },

        getBidCountDebrief(itemId) {
            if (!this.debriefData?.bids || !this.debriefData.bids[itemId])
                return 0;
            return Object.keys(this.debriefData.bids[itemId]).length;
        }
    }
}
