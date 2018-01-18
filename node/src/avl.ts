interface TreeNode<T> {
  value: T,
  leftChild?: TreeNode<T>,
  rightChild?: TreeNode<T>
}



function search<T>(tree: TreeNode<T> | undefined, key: T): TreeNode<T> | undefined {
  if (tree === undefined || key === tree.value) {
    return tree
  }

  if (key > tree.value) {
    return search(tree.leftChild, key)
  } else {
    return search(tree.rightChild, key)
  }
}


function deleteNode<T>(tree: TreeNode<T>, key: T): boolean {
  
  return false
}


function del<T>(parent: TreeNode<T>, node: TreeNode<T>): void {

}
