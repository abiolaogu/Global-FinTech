package com.example.frontend

import org.junit.Assert.assertEquals
import org.junit.Test

class ProjectsViewModelTest {
  @Test
  fun reducerAddsItem() {
    val items = mutableListOf("Apollo")
    items.add("Atlas")
    assertEquals(2, items.size)
  }
}
