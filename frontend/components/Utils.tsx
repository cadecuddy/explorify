const HOURS_IN_SECONDS = 1000 * 60 * 60;

export const decodeHTMLEntities = (text: string | undefined) => {
  if (!text) return "";
  const textArea = document.createElement("textarea");
  textArea.innerHTML = text;
  return textArea.value;
};

/**
 * Helper function for checking if the site has been accessed in the last hour
 * to avoid unnecessary playlist processing.
 *
 * @returns {boolean} - True if the site has not been accessed in the last hour
 */
export function checkLocalStorage(): boolean {
  const localStore = localStorage.getItem("explorify.store");

  if (!localStore) {
    createLocalStorage();
    return true;
  }

  if (localStore) {
    const parsedLocalStore = JSON.parse(localStore);

    // If the site has not been accessed in the last 24 hours
    if (Date.now() - parsedLocalStore.siteAccessed > HOURS_IN_SECONDS * 24) {
      createLocalStorage();
      return true;
    }
  }

  return false;
}

function createLocalStorage() {
  localStorage.clear();

  const localStore = {
    siteAccessed: Date.now(),
  };

  localStorage.setItem("explorify.store", JSON.stringify(localStore));
}
