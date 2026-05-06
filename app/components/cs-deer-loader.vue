<template>
  <div class="deer-loader">
    <img
      src="/img/deer-logo.png"
      alt="Loading"
      class="loading-icon"
    >
  </div>
</template>

<style lang="scss" scoped>
.deer-loader {
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-icon {
  animation: rotate 2s linear infinite;
  max-height: 100px;
}

@keyframes rotate {
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}
</style>
