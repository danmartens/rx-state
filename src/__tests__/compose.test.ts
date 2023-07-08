import { compose } from '../compose';
import { createSelector } from '../createSelector';

type OrderState = {
  number: string;
  lineItems: {
    id: string;
    quantity: number;
    price: number;
  }[];
};

const getLineItemIds = compose(
  (state: OrderState) => state.lineItems,
  createSelector((lineItems: OrderState['lineItems']) =>
    lineItems.map((lineItem) => lineItem.id)
  )
);

describe('compose', () => {
  test('should compose selectors', () => {
    const state: OrderState = {
      number: '123',
      lineItems: [
        {
          id: '456',
          quantity: 1,
          price: 100,
        },
        {
          id: '789',
          quantity: 2,
          price: 200,
        },
      ],
    };

    expect(getLineItemIds(state)).toEqual(['456', '789']);
    expect(getLineItemIds(state)).toBe(getLineItemIds(state));

    const nextState: OrderState = {
      ...state,
    };

    expect(getLineItemIds(nextState)).toBe(getLineItemIds(state));
  });
});
