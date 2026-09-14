const TOKEN_KEY = 'pos-go.tab-token';

export const getTabToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setTabToken = (token: string) => sessionStorage.setItem(TOKEN_KEY, token);
export const clearTabToken = () => sessionStorage.removeItem(TOKEN_KEY);
