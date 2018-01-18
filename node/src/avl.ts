interface TreeNode<T> {
  value: T,
  leftChild?: TreeNode<T>,
  rightChild?: TreeNode<T>
}

type Child = 'leftChild' | 'rightChild'


function search<T>(node: TreeNode<T> | undefined, key: T): TreeNode<T> | undefined {
  if (node === undefined || key === node.value) {
    return node
  }

  if (key > node.value) {
    return search(node.leftChild, key)
  } else {
    return search(node.rightChild, key)
  }
}


function deleteNode<T>(node: TreeNode<T>, key: T): TreeNode<T> | undefined {
  if (node.value === key) {
    return del(node)
  }

  if (node.value > key) {
    if (node.leftChild) {
      node.leftChild = deleteNode(node.leftChild, key)
    }
  } else {
    if (node.rightChild) {
      node.rightChild = deleteNode(node.rightChild, key)
    }
  }

  return node
}


function del<T>(node: TreeNode<T>): TreeNode<T> | undefined {
  if (!node.leftChild) {
    return node.rightChild
  }
  if (!node.rightChild) {
    return node.leftChild
  }
  // find the node before node
  let p = node
  let q = node.leftChild
  while (q.rightChild) {
    p = q
    q = q.rightChild
  }

  node.value = q.value
  if (p === node) {
    p.leftChild = q.leftChild
  } else {
    p.rightChild = q.leftChild
  }
  return node
}


function del2<T>(node: TreeNode<T>): TreeNode<T> | undefined {
  if (!node.leftChild) {
    return node.rightChild
  }
  if (!node.rightChild) {
    return node.leftChild
  }

  // remove node
  let q = node.leftChild
  while(q.rightChild) {
    q = q.rightChild
  }
  q.rightChild = node.rightChild

  return node.leftChild
}


interface AvlNode<T> {
  value: T,
  leftChild: AvlNode<T>,
  rightChild: AvlNode<T>,
  height: number
}


function rightRotate<T>(node: AvlNode<T>): AvlNode<T> {
  let top = node.leftChild!
  node.leftChild = top.rightChild
  top.rightChild = node
  return top
}

function leftRotate<T>(node: AvlNode<T>): AvlNode<T> {
  let top = node.rightChild
  node.rightChild = top.leftChild
  top.leftChild = node
  return top
}

function insert<T>(tree: AvlNode<T>, key: T): AvlNode<T> {

  return tree
}


