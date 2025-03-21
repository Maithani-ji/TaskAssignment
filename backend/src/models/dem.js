// let obj = { a: 1 }
// let obj2 = { a: 1 }

// if (obj == obj2)
// {
//     console.log("Both objects are the same");
// }
// let obj3 = obj
// if (obj === obj3)
// {
//     console.log("Both objects are the same");
// }

//         Promise.resolve(1) 
//   .then((value) => {
//     console.log("Then 1:", value); 
//     return value * 2;
//   }) // op 2
//   .then((value) => {
//     console.log("Then 2:", value); 
//     return value * 2;
//   }) //op 1
//   .finally(() => {
//     console.log("Finally: Cleanup task"); 
//   }) 
//   .then((value) => {
//     console.log("Then 3:", value); 
//     return value * 2; 
//   })// op 8
//   .then((value) => {
//     console.log("Then 4:", value); 
//     return value * 2; 
//   })// op 4
//   .catch((error) => {
//     console.log("Catch:", error.message); 
//   });
// Then 2 :1
// Then 1: 2

// Then 4: 4
// Then 3: 8
// Finally Clean up 


// const fetcRecall = () => {
//     fecthCall()
// }
// const fecthCall=async() => {
//     try {
//         const response = await axios.get()
        
//         if (response?.status == 200)
//         {
            

//             }
//     } catch (error) {
        
//     }
// }
{ 
    let obj = { a: 1 };
    let obj2 = { a: 1 };
    
    if (obj === obj2)
    {
        console.log("Both objects are the same");
    }
    
    let obj3 = obj;
    if (obj === obj3)
    {
        console.log("Both objects are the same");
    }
}
import './style.css';
const MyReact = (function () {
  let x;
  let y = [];
  function hook(initialValue) {
    console.log(initialValue);
    let state = x || initialValue;
    const setState = (newValue) => {
      // console.log('inside state', newValue);
      x = newValue;
    };

    // x++;
    // console.log('outside log', state);
    return [state, setState];
  }

  function render(Component) {
    const C = Component();
    C.render();
    return C;
  }
  return { hook, render };
})();

function OrderComponent() {
  const [quantity, setQuantity] = MyReact.hook(1);
  // const [itemName, setItemName] = MyReact.hook([]);
  return {
    render: () => {
      console.log({ quantity });
    },
    addItem: () => {
      setQuantity(quantity + 1);
      // setItemName([...itemName, t]);
    },
  };
}

var app = MyReact.render(OrderComponent);
app.addItem();

// app.addItem('Apple Watch');
app = MyReact.render(OrderComponent);
app.addItem();
// app=MyReact.addItem()
// app.addItem('Iphone');
app = MyReact.render(OrderComponent);



import './style.css';
const MyReact = (function () {
  function hook(initialValue) {
    console.log({ initialValue });
    let state = initialValue;
    const setState = (newValue) => {
      state = newValue;
    };
    return [state, setState];
  }

  function render(Component) {
    const C = Component();
    C.render();
    return C;
  }
  return { hook, render };
})();

function OrderComponent() {
  const [quantity, setQuantity] = MyReact.hook(0);
  const [itemName, setItemName] = MyReact.hook([]);
  return {
    render: () => {
      console.log({ quantity, itemName });
    },
    addItem: (t) => {
      setQuantity(quantity + 1);
      setItemName([...itemName, t]);
    },
  };
}

var app = MyReact.render(OrderComponent);
app.addItem('Apple Watch');
app = MyReact.render(OrderComponent);
app.addItem('Iphone');
app = MyReact.render(OrderComponent);
