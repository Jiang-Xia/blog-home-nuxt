<script setup lang='ts'>
import {reactive, ref } from 'vue'
import axios from 'axios'
axios.get('https://jiang-xia.top/x-api/blog-server/article/info?id=16').then(res=>{
    console.log(res,'res')
})
</script>
<template>
<el-button type="primary">Primary</el-button><br/>
home
</template>
<style lang='scss' scoped>
</style>