/* =========================================
   🚀 NOVADROP
   Telegram Mini App
   Coins + XP + Level + Streak
   Tasks + Shop + Transactions
   Supabase
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
  window.Telegram?.WebApp || null;

let telegramUser = null;

if (tg) {

  tg.ready();
  tg.expand();

  telegramUser =
    tg.initDataUnsafe?.user || null;

}


/* =========================================
   USER ID
========================================= */

function getUserId() {

  if (!telegramUser) {
    return null;
  }

  /*
    profiles.id در Supabase از نوع UUID است.
    بنابراین Telegram ID را مستقیماً داخل id نمی‌گذاریم.
  */

  return telegramUser.id
    ? String(telegramUser.id)
    : null;
}


/* =========================================
   DEFAULT DATA
========================================= */

const DEFAULT_DATA = {

  coins: 0,

  xp: 0,

  level: 1,

  streak: 0,

  completedTasks: [],

  transactions: [],

  purchases: [],

  lastStreakDate: null

};


let data =
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


/* =========================================
   TASKS
========================================= */

const TASKS = {

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
  },

  wallet: {
    title: "Connect TON Wallet",
    xp: 100,
    coins: 100
  }

};


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
   LEVEL
========================================= */

function calculateLevel() {

  let level = 1;

  let remainingXP =
    Number(data.xp) || 0;

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

    level,

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

    const percentage =
      (
        levelData.currentXP /
        levelData.neededXP
      ) * 100;


    progress.style.width =
      Math.min(
        100,
        percentage
      ) + "%";

  }


  renderTasks();

  renderTransactions();

  save();

}


/* =========================================
   COMPLETE TASK
========================================= */

async function completeTask(taskId) {

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

    alert(
      "TON Wallet connection will be added next. 💎"
    );

  }


  data.xp += task.xp;

  data.coins += task.coins;


  data.completedTasks.push(
    taskId
  );


  data.transactions.unshift({

    type: "earn",

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
          "task-" + taskId
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

async function claimStreak() {

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


  if (
    !data.lastStreakDate
  ) {

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
        ) /
        86400000
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

    type: "earn",

    amount:
      reward,

    description:
      "Daily Streak Reward",

    date:
      new Date()
        .toLocaleString()

  });


  updateUI();


  await saveToSupabase();


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

async function buyItem(
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

    name,

    price,

    date:
      new Date()
        .toLocaleString()

  });


  data.transactions.unshift({

    type: "spend",

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


  await saveToSupabase();


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
            border-bottom:
              1px solid #202b3d;
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
   SAVE TO SUPABASE
========================================= */

async function saveToSupabase() {

  const telegramId =
    getUserId();


  if (!telegramId) {

    console.log(
      "⚠️ Telegram user not available."
    );

    return;

  }


  try {

    /*
      چون profiles.id از نوع UUID است،
      برای اتصال Telegram به پروفایل
      از username استفاده می‌کنیم.
    */

    const username =
      telegramUser?.username ||
      telegramUser?.first_name ||
      "NovaPlayer";


    /*
      ابتدا بررسی می‌کنیم آیا
      پروفایلی با username وجود دارد.
    */

    const {
      data: existing,
      error: findError
    } =
      await supabaseClient
        .from("profiles")
        .select(
          "id"
        )
        .eq(
          "username",
          username
        )
        .maybeSingle();


    if (findError) {

      console.error(
        "Supabase find error:",
        findError
      );

      return;

    }


    let profileId;


    if (existing) {

      profileId =
        existing.id;

    } else {

      /*
        اگر پروفایل وجود نداشت،
        یک UUID جدید برای آن ساخته می‌شود.
      */

      const {
        data: created,
        error: createError
      } =
        await supabaseClient
          .from("profiles")
          .insert({

            username,

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

          })
          .select(
            "id"
          )
          .single();


      if (createError) {

        console.error(
          "Supabase create error:",
          createError
        );

        return;

      }


      profileId =
        created.id;

    }


    /*
      بروزرسانی پروفایل
    */

    const {
      error: updateError
    } =
      await supabaseClient
        .from("profiles")
        .update({

          username,

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

        })
        .eq(
          "id",
          profileId
        );


    if (updateError) {

      console.error(
        "Supabase update error:",
        updateError
      );

      return;

    }


    console.log(
      "✅ NovaDrop data saved!"
    );

  } catch (error) {

    console.error(
      "Supabase error:",
      error
    );

  }

}


/* =========================================
   LOAD FROM SUPABASE
========================================= */

async function loadFromSupabase() {

  const telegramId =
    getUserId();


  if (!telegramId) {

    console.log(
      "⚠️ NovaDrop must be opened inside Telegram."
    );

    return;

  }


  try {

    const username =
      telegramUser?.username ||
      telegramUser?.first_name ||
      "NovaPlayer";


    const {
      data: profile,
      error
    } =
      await supabaseClient
        .from("profiles")
        .select(
          "id, username, coins, xp, level, streak, completed_tasks"
        )
        .eq(
          "username",
          username
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

      console.log(
        "No profile yet. Creating..."
      );

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
      "✅ NovaDrop data loaded!"
    );

  } catch (error) {

    console.error(
      "Supabase load error:",
      error
    );

  }

}


/* =========================================
   RESET
========================================= */

async function resetProgress() {

  if (
    !confirm(
      "Reset all NovaDrop progress?"
    )
  ) {

    return;

  }


  data =
    JSON.parse(
      JSON.stringify(
        DEFAULT_DATA
      )
    );


  save();

  updateUI();

  await saveToSupabase();


  alert(
    "NovaDrop progress reset 🔄"
  );

}


/* =========================================
   TELEGRAM INFO
========================================= */

if (telegramUser) {

  console.log(
    "🚀 NovaDrop Telegram version loaded!"
  );

  console.log(
    "Telegram User ID:",
    telegramUser.id
  );

  console.log(
    "Telegram Username:",
    telegramUser.username ||
    telegramUser.first_name
  );

} else {

  console.log(
    "⚠️ NovaDrop must be opened inside Telegram."
  );

}


/* =========================================
   START
========================================= */

updateUI();

loadFromSupabase();


console.log(
  "🚀 NovaDrop JavaScript loaded!"
);
