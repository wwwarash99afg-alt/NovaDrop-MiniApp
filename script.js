/* =========================================
   🚀 NOVADROP
   Telegram Mini App
   Coins + XP + Level + Streak
   Tasks + Transactions + Shop
   TON Connect Wallet
========================================= */


/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
  "https://amtabsacamnfzikwmfxr.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_i-DXZ0D1j1kn1PxnCggsRA_TjWRDeuP";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* =========================================
   TELEGRAM
========================================= */

const tg =
  window.Telegram &&
  window.Telegram.WebApp
    ? window.Telegram.WebApp
    : null;

if (tg) {
  tg.ready();
  tg.expand();
}


/* =========================================
   TELEGRAM USER
========================================= */

let telegramUser = null;

if (tg && tg.initDataUnsafe) {
  telegramUser =
    tg.initDataUnsafe.user || null;
}

console.log(
  "🚀 NovaDrop Telegram version loaded!"
);

if (telegramUser) {

  console.log(
    "Telegram User ID:",
    telegramUser.id
  );

  console.log(
    "Telegram Username:",
    telegramUser.username || "No username"
  );

} else {

  console.log(
    "Telegram user not detected."
  );

}


/* =========================================
   TASKS
========================================= */

const TASKS = {

  wallet: {
    title: "Connect TON Wallet",
    xp: 100,
    coins: 100
  },

  channel: {
    title: "Join Channel",
    xp: 100,
    coins: 100
  },

  invite: {
    title: "Invite Friends",
    xp: 50,
    coins: 50
  },

  daily: {
    title: "Daily Check-in",
    xp: 10,
    coins: 10
  }

};


/* =========================================
   DEFAULT DATA
========================================= */

const DEFAULT_DATA = {

  coins: 0,

  xp: 0,

  level: 1,

  streak: 0,

  lastStreakDate: null,

  completedTasks: [],

  transactions: [],

  purchases: [],

  walletAddress: null

};


/* =========================================
   LOAD LOCAL DATA
========================================= */

let data;

try {

  data =
    JSON.parse(
      localStorage.getItem(
        "novadrop_data"
      )
    ) ||
    JSON.parse(
      JSON.stringify(
        DEFAULT_DATA
      )
    );

} catch (error) {

  data =
    JSON.parse(
      JSON.stringify(
        DEFAULT_DATA
      )
    );

}


/* =========================================
   SAVE LOCAL
========================================= */

function save() {

  localStorage.setItem(
    "novadrop_data",
    JSON.stringify(data)
  );

}


/* =========================================
   LEVEL SYSTEM
========================================= */

function calculateLevel() {

  let level = 1;

  let remainingXP = data.xp;

  let xpNeeded = 100;


  while (
    remainingXP >= xpNeeded
  ) {

    remainingXP -= xpNeeded;

    level++;

    xpNeeded =
      level * 100;

  }


  return {

    level: level,

    currentXP:
      remainingXP,

    neededXP:
      xpNeeded

  };

}


/* =========================================
   UPDATE UI
========================================= */

function updateUI() {

  const levelData =
    calculateLevel();


  data.level =
    levelData.level;


  const elements = {

    coins:
      data.coins,

    xp:
      data.xp,

    level:
      data.level,

    streak:
      data.streak,

    walletCoins:
      data.coins,

    shopCoins:
      data.coins,

    levelLabel:
      data.level,

    dailyStreak:
      data.streak,

    leaderXP:
      data.xp + " XP",

    profileLevel:
      data.level,

    profileStreak:
      data.streak,

    xpText:
      levelData.currentXP +
      " / " +
      levelData.neededXP +
      " XP"

  };


  Object.keys(elements)
    .forEach(id => {

      const element =
        document.getElementById(id);

      if (element) {

        element.textContent =
          elements[id];

      }

    });


  const progress =
    document.getElementById(
      "levelProgress"
    );


  if (progress) {

    const percent =
      (
        levelData.currentXP /
        levelData.neededXP
      ) * 100;


    progress.style.width =
      Math.min(
        100,
        percent
      ) + "%";

  }


  const walletStatus =
    document.getElementById(
      "walletStatus"
    );


  const connectedWallet =
    document.getElementById(
      "connectedWallet"
    );


  if (data.walletAddress) {

    if (walletStatus) {

      walletStatus.textContent =
        "✅ Wallet Connected";

    }


    if (connectedWallet) {

      connectedWallet.textContent =
        "TON: " +
        shortenAddress(
          data.walletAddress
        );

    }

  } else {

    if (walletStatus) {

      walletStatus.textContent =
        "Connect your TON wallet";

    }


    if (connectedWallet) {

      connectedWallet.textContent =
        "";

    }

  }


  renderTasks();

  renderTransactions();

  save();

}


/* =========================================
   SHORTEN WALLET ADDRESS
========================================= */

function shortenAddress(address) {

  if (!address) {
    return "";
  }


  if (address.length < 15) {
    return address;
  }


  return (
    address.slice(0, 6) +
    "..." +
    address.slice(-6)
  );

}


/* =========================================
   COMPLETE TASK
========================================= */

function completeTask(taskId) {

  const task =
    TASKS[taskId];


  if (!task) {
    return;
  }


  if (
    data.completedTasks
      .includes(taskId)
  ) {

    alert(
      "This task is already completed ✓"
    );

    return;

  }


  /* CHANNEL */

  if (taskId === "channel") {

    window.open(
      "https://t.me/NovaDropOfficial",
      "_blank"
    );

  }


  /* WALLET */

  if (taskId === "wallet") {

    if (!data.walletAddress) {

      alert(
        "Please connect your TON Wallet first."
      );

      return;

    }

  }


  data.xp +=
    task.xp;


  data.coins +=
    task.coins;


  data.completedTasks.push(
    taskId
  );


  data.transactions.unshift({

    type:
      "earn",

    amount:
      task.coins,

    description:
      task.title,

    date:
      new Date()
        .toLocaleString()

  });


  updateUI();

  saveToSupabase();


  alert(
    task.title +
    " completed!\n\n+" +
    task.xp +
    " XP\n+" +
    task.coins +
    " Coins"
  );

}


/* =========================================
   RENDER TASKS
========================================= */

function renderTasks() {

  Object.keys(TASKS)
    .forEach(taskId => {

      const element =
        document.getElementById(
          "task-" +
          taskId
        );


      if (!element) {
        return;
      }


      const button =
        element.querySelector(
          "button"
        );


      if (
        data.completedTasks
          .includes(taskId)
      ) {

        element.classList.add(
          "completed"
        );


        if (button) {

          button.textContent =
            "✓ Done";

          button.disabled =
            true;

        }

      } else {

        element.classList.remove(
          "completed"
        );


        if (button) {

          button.textContent =
            "+" +
            TASKS[taskId].xp;

          button.disabled =
            false;

        }

      }

    });

}


/* =========================================
   DAILY STREAK
========================================= */

function claimStreak() {

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);


  if (
    data.lastStreakDate ===
    today
  ) {

    alert(
      "Today's reward is already claimed 🔥"
    );

    return;

  }


  if (!data.lastStreakDate) {

    data.streak = 1;

  } else {

    const previous =
      new Date(
        data.lastStreakDate
      );


    const current =
      new Date(today);


    const difference =
      Math.floor(
        (
          current -
          previous
        ) / 86400000
      );


    if (
      difference === 1
    ) {

      data.streak++;

    } else {

      data.streak = 1;

    }

  }


  data.lastStreakDate =
    today;


  const reward =
    Math.min(
      500,
      data.streak * 25
    );


  data.coins +=
    reward;


  data.transactions.unshift({

    type:
      "earn",

    amount:
      reward,

    description:
      "Daily Streak Reward",

    date:
      new Date()
        .toLocaleString()

  });


  updateUI();

  saveToSupabase();


  alert(
    "🔥 " +
    data.streak +
    " Day Streak!\n\n+" +
    reward +
    " Coins"
  );

}


/* =========================================
   SHOP
========================================= */

function buyItem(
  name,
  price
) {

  if (
    data.coins < price
  ) {

    alert(
      "Not enough Coins 🪙"
    );

    return;

  }


  data.coins -=
    price;


  data.purchases.push({

    name:
      name,

    price:
      price,

    date:
      new Date()
        .toLocaleString()

  });


  data.transactions.unshift({

    type:
      "spend",

    amount:
      price,

    description:
      "Shop: " +
      name,

    date:
      new Date()
        .toLocaleString()

  });


  updateUI();

  saveToSupabase();


  alert(
    name +
    " purchased successfully! 🛍️"
  );

}


/* =========================================
   TRANSACTIONS
========================================= */

function renderTransactions() {

  const container =
    document.getElementById(
      "transactions"
    );


  if (!container) {
    return;
  }


  if (
    !data.transactions.length
  ) {

    container.innerHTML =
      '<p style="color:#8f9aaa;">No transactions yet.</p>';

    return;

  }


  container.innerHTML =
    data.transactions
      .slice(0, 20)
      .map(transaction => {

        const sign =
          transaction.type ===
          "earn"
            ? "+"
            : "-";


        return `
          <div style="
            padding:10px 0;
            border-bottom:1px solid #202b3d;
          ">

            <strong>
              ${transaction.description}
            </strong>

            <span style="
              float:right;
              color:#00eaff;
            ">
              ${sign}${transaction.amount} 🪙
            </span>

            <small style="
              display:block;
              color:#8f9aaa;
              margin-top:4px;
            ">
              ${transaction.date}
            </small>

          </div>
        `;

      })
      .join("");

}


/* =========================================
   SUPABASE SAVE
========================================= */

async function saveToSupabase() {

  try {

    if (
      !telegramUser ||
      !telegramUser.id
    ) {

      console.log(
        "No Telegram user."
      );

      return;

    }


    const profile = {

      id:
        String(
          telegramUser.id
        ),

      username:
        telegramUser.username ||
        telegramUser.first_name ||
        "NovaPlayer",

      coins:
        data.coins,

      xp:
        data.xp,

      level:
        data.level,

      streak:
        data.streak,

      completed_tasks:
        data.completedTasks,

      updated_at:
        new Date()
          .toISOString()

    };


    const { error } =
      await supabaseClient
        .from("profiles")
        .upsert(
          profile
        );


    if (error) {

      console.error(
        "Supabase save error:",
        error
      );

      return;

    }


    console.log(
      "✅ NovaDrop data saved to Supabase!"
    );

  } catch (error) {

    console.error(
      "Supabase error:",
      error
    );

  }

}


/* =========================================
   SUPABASE LOAD
========================================= */

async function loadFromSupabase() {

  try {

    if (
      !telegramUser ||
      !telegramUser.id
    ) {

      console.log(
        "No Telegram user."
      );

      return;

    }


    const { data: profile, error } =
      await supabaseClient
        .from("profiles")
        .select(
          "coins, xp, level, streak, completed_tasks"
        )
        .eq(
          "id",
          String(
            telegramUser.id
          )
        )
        .maybeSingle();


    if (error) {

      console.error(
        "Supabase load error:",
        error
      );

      return;

    }


    if (!profile) {

      await saveToSupabase();

      return;

    }


    data.coins =
      Number(
        profile.coins
      ) || 0;


    data.xp =
      Number(
        profile.xp
      ) || 0;


    data.level =
      Number(
        profile.level
      ) || 1;


    data.streak =
      Number(
        profile.streak
      ) || 0;


    if (
      Array.isArray(
        profile.completed_tasks
      )
    ) {

      data.completedTasks =
        profile.completed_tasks;

    }


    save();

    updateUI();


    console.log(
      "✅ NovaDrop data loaded from Supabase!"
    );

  } catch (error) {

    console.error(
      "Supabase load error:",
      error
    );

  }

}


/* =========================================
   TON CONNECT
========================================= */

let tonConnectUI = null;


/* =========================================
   INIT TON CONNECT
========================================= */

function initTONConnect() {

  if (
    typeof TON_CONNECT_UI ===
    "undefined"
  ) {

    console.error(
      "TON Connect library not loaded."
    );

    return;

  }


  const button =
    document.getElementById(
      "ton-connect"
    );


  if (!button) {

    console.error(
      "TON Connect container not found."
    );

    return;

  }


  try {

    tonConnectUI =
      new TON_CONNECT_UI.TonConnectUI({

        manifestUrl:
          window.location.origin +
          "/tonconnect-manifest.json",

        buttonRootId:
          "ton-connect"

      });


    tonConnectUI.onStatusChange(
      async wallet => {

        if (wallet) {

          await onWalletConnected(
            wallet
          );

        } else {

          onWalletDisconnected();

        }

      }
    );


    console.log(
      "💎 TON Connect initialized!"
    );


  } catch (error) {

    console.error(
      "TON Connect initialization error:",
      error
    );

  }

}


/* =========================================
   WALLET CONNECTED
========================================= */

async function onWalletConnected(
  wallet
) {

  const address =
    wallet.account &&
    wallet.account.address
      ? wallet.account.address
      : null;


  if (!address) {

    console.error(
      "Wallet address not found."
    );

    return;

  }


  const wasAlreadyConnected =
    data.walletAddress ===
    address;


  data.walletAddress =
    address;


  updateUI();


  /*
     Give wallet reward
     only once.
  */

  if (
    !wasAlreadyConnected &&
    !data.completedTasks.includes(
      "wallet"
    )
  ) {

    const task =
      TASKS.wallet;


    data.xp +=
      task.xp;


    data.coins +=
      task.coins;


    data.completedTasks.push(
      "wallet"
    );


    data.transactions.unshift({

      type:
        "earn",

      amount:
        task.coins,

      description:
        task.title,

      date:
        new Date()
          .toLocaleString()

    });


    updateUI();

    await saveToSupabase();


    alert(
      "💎 TON Wallet Connected!\n\n" +
      "+100 XP\n" +
      "+100 Coins"
    );

  } else {

    await saveToSupabase();

  }


  console.log(
    "💎 Connected wallet:",
    address
  );

}


/* =========================================
   WALLET DISCONNECTED
========================================= */

function onWalletDisconnected() {

  data.walletAddress =
    null;


  updateUI();


  console.log(
    "TON Wallet disconnected."
  );

}


/* =========================================
   DISCONNECT WALLET
========================================= */

async function disconnectTONWallet() {

  if (!tonConnectUI) {
    return;
  }


  try {

    await tonConnectUI.disconnect();

  } catch (error) {

    console.error(
      "TON disconnect error:",
      error
    );

  }

}


/* =========================================
   AUTH STATE
========================================= */

if (supabaseClient) {

  supabaseClient.auth.onAuthStateChange(
    event => {

      console.log(
        "Supabase Auth event:",
        event
      );

    }
  );

}


/* =========================================
   START
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    updateUI();

    initTONConnect();

    await loadFromSupabase();

    console.log(
      "🚀 NovaDrop JavaScript loaded!"
    );

  }
);
