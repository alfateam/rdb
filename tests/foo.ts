// foo.ts
import orm from './orm';

const party = orm.table('party').map(mapper => {
  return {
    pid: mapper.primaryColumn('foo').uuid(),
    plocation: mapper.column('bar').string(),
    plocation2: mapper.column('dbar').string(),
  }
});


const customerMapped = orm.table('customer').map(mapper => {
  return {
    id: mapper.primaryColumn('id').uuid().notNull(),
    name: mapper.column('name').string(),
    partyId: mapper.column('partyId').uuid(),
  };
})
.map(mapper => {
  return {
    party: mapper.references(party).by('partyId')
  }
});

const orderMapped = orm.table('order').map(({column, primaryColumn}) => {
  return {
    id: primaryColumn('id').uuid().notNull(),
    name: column('name').string().notNull(),
    balance: column('balance').numeric(),
    createdAt: column('created_at').date(),
    updatedAt: column('updated_at').date(),
    customerId: column('customer_id').uuid(),
    picture: column('picture').json()
  };
}).map(mapper => {
  return {
    customer: mapper.references(customerMapped).by('customerId')
  }
});
const customer2 = customerMapped.map(x => {
  return {
    orders: x.hasOne(orderMapped).by('customerId')
  }
})
customer2.
const filter = orderMapped.customer.name.equal('lars');


const row = await orderMapped.getOne(filter, {
  orderBy: ['balance'],
  customer: true,
  createdAt: true
  // balance: false,
  // , customer: { name: true }
  // customer: {


  // }
  // customer: {
  //   id: true
  // }
  // customer: {id: true}
  // customer: {
  // //   orderBy: ['partyId asc'],    
  // //   orders: {

  // //   }

  // }
});
