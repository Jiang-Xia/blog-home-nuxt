<script setup>
const { theme, setTheme } = useThemeActions();

function changeTheme(e) {
  const dataTheme = e.currentTarget.dataset.setTheme;
  theme.value = dataTheme;
  setClass(e);
  setTheme();
  console.log('当前主题：', dataTheme);
}
const menu = ref(null);

const setClass = (e) => {
  const btns = menu.value.querySelectorAll('button');
  btns.forEach((btn) => {
    btn.classList.remove('[&_svg]:visible');
  });
  e.currentTarget.classList.add('[&_svg]:visible');
};
</script>

<template>
  <div title="切换主题" class="dropdown dropdown-end block">
    <div
      tabindex="0"
      role="button"
      class="btn group btn-sm gap-1.5 px-1.5 btn-ghost"
      aria-label="切换主题"
    >
      <div
        class="bg-base-100 group-hover:border-base-content/20 border-base-content/10 grid shrink-0 grid-cols-2 gap-0.5 rounded-md border p-1 transition-colors"
      >
        <div class="bg-base-content size-1 rounded-full" />
        <div class="bg-primary size-1 rounded-full" />
        <div class="bg-secondary size-1 rounded-full" />
        <div class="bg-accent size-1 rounded-full" />
      </div>
      <svg
        width="12px"
        height="12px"
        class="mt-px hidden size-2 fill-current opacity-60 sm:inline-block"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 2048 2048"
      >
        <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
      </svg>
    </div>
    <div
      tabindex="0"
      class="dropdown-content bg-base-200 text-base-content rounded-box top-px h-[30.5rem] max-h-[calc(100vh-8.6rem)] overflow-y-auto border-[length:var(--border)] border-white/5 shadow-2xl outline-[length:var(--border)] outline-black/5 mt-16"
    >
      <ul ref="menu" class="menu w-56">
        <li class="menu-title text-xs">
          主题
        </li>
        <!-- [ --><li>
          <button
            class="gap-3 px-2"
            data-set-theme="light"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="light"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              light
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="dark"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="dark"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              dark
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="cupcake"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="cupcake"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              cupcake
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="bumblebee"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="bumblebee"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              bumblebee
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="emerald"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="emerald"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              emerald
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="corporate"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="corporate"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              corporate
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="synthwave"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="synthwave"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              synthwave
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="retro"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="retro"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              retro
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="cyberpunk"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="cyberpunk"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              cyberpunk
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="valentine"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="valentine"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              valentine
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="halloween"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="halloween"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              halloween
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="garden"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="garden"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              garden
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="forest"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="forest"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              forest
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="aqua"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="aqua"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              aqua
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="lofi"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="lofi"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              lofi
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="pastel"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="pastel"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              pastel
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="fantasy"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="fantasy"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              fantasy
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="wireframe"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="wireframe"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              wireframe
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="black"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="black"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              black
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="luxury"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="luxury"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              luxury
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="dracula"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="dracula"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              dracula
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="cmyk"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="cmyk"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              cmyk
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2 [&amp;_svg]:visible"
            data-set-theme="autumn"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="autumn"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              autumn
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="business"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="business"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              business
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="acid"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="acid"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              acid
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="lemonade"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="lemonade"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              lemonade
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="night"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="night"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              night
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="coffee"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="coffee"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              coffee
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="winter"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="winter"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              winter
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="dim"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="dim"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              dim
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="nord"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="nord"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              nord
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="sunset"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="sunset"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              sunset
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="caramellatte"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="caramellatte"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              caramellatte
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="abyss"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="abyss"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              abyss
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li><li>
          <button
            class="gap-3 px-2"
            data-set-theme="silk"
            data-act-class="[&amp;_svg]:visible"
            @click="changeTheme"
          >
            <div
              data-theme="silk"
              class="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
            >
              <div class="bg-base-content size-1 rounded-full" />
              <div class="bg-primary size-1 rounded-full" />
              <div class="bg-secondary size-1 rounded-full" />
              <div class="bg-accent size-1 rounded-full" />
            </div>
            <div class="w-32 truncate">
              silk
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="invisible h-3 w-3 shrink-0"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .\[\&_svg\]\:visible svg {
    visibility: visible;
  }
</style>
