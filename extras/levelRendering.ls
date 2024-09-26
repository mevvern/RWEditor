﻿global gLEProps, gSkyColor, gTEprops, gLastImported, tileSetIndex, gTiles, gTinySignsDrawn, gLOprops
global gRenderCameraTilePos, gRenderCameraPixelPos, gRenderTrashProps

on renderLevel()
  tm = _system.milliseconds
  
  gSkyColor = color(0,0,0)
  gTinySignsDrawn = 0
  
  gRenderTrashProps = []
  
  RENDER = 0
  
  -- member("shortCutSymbolsImg").image = image(1040, 800, 1)
  -- saveLvl()
  cols = 100--gLOprops.size.loch
  rows = 60--gLOprops.size.locv
  
  -- member("bkgBkgImage").image = image(cols*20, rows*20, 16)
  member("finalImage").image = image(cols*20, rows*20, 32)
  
  the randomSeed = gLOprops.tileSeed
  
  setUpLayer(3)
  setUpLayer(2)
  setUpLayer(1)
  
  gLastImported = ""
  
  global gLoadedName
  
  put gLoadedName && "rendered in" && (_system.milliseconds-tm)
end





on setUpLayer(layer)
  -- global gLoprops
  cols = 100--gLoprops.size.loch
  rows = 60--gLoprops.size.locv
  tlset = member("tileSet1").image.duplicate()
  if layer = 1 then
    dpt = 0
    --  ofst = 0
    -- tlset = recolor(tlset, ofst)
  else if layer = 2 then
    dpt = 10
    -- ofst = 0
    -- tlset = recolor(tlset, ofst)
  else
    dpt = 20
    --  ofst = 0
    -- tlset = recolor(tlset, ofst)
  end if
  
  --  repeat with q = dpt to dpt+9 then
  --    member("layer"&string(q)).image = image(cols*20, rows*20, 32)
  --  end repeat
  
  --  member("concreteTexture").image = image(1040,800,32)
  --  repeat with q = 1 to 10 then
  --    repeat with c = 1 to 8 then
  --      member("concreteTexture").image.copyPixels( member("concreteTexture2").image, rect((q-1)*108, (c-1)*108,q*108,c*108), rect(0,0,108,108) )
  --    end repeat
  --  end repeat
  global gLOprops
  
  member("vertImg").image = image(cols*20, rows*20, 32)
  member("horiImg").image = image(cols*20, rows*20, 32)
  
  frntImg = image(cols*20, rows*20, 32)
  mdlFrntImg = image(cols*20, rows*20, 32)
  mdlBckImg = image(cols*20, rows*20, 32)
  
  -- pltt = [member("currentPalette").image.getPixel(0+ofst, 0), member("currentPalette").image.getPixel(1+ofst, 0), member("currentPalette").image.getPixel(2+ofst, 0)]
  
  poleCol = color(255,0,0)
  -- if gLOProps.pals[gLOProps.pal].detCol <> color(255,0,0) then
  --  poleCol = color(0,0,255)
  -- end if
  
  
  floorsL = []
  drawLaterTiles = []
  drawLastTiles = []
  shortCutEntrences = []
  shortCuts = []
  -- depthPnt(pnt, dpt)
  repeat with q = 1 to cols then
    repeat with c = 1 to rows then
      -- if((q >= gRenderCameraTilePos.locH)and(q < gRenderCameraTilePos.locH + cols)and(c >= gRenderCameraTilePos.locV)and(c < gRenderCameraTilePos.locV + rows))or(checkIfTileHasMaterialRenderTypeTiles(point(q,c), layer))then
      if(q+gRenderCameraTilePos.locH > 0)and(q+gRenderCameraTilePos.locH <= gLOprops.size.locH)and(c+gRenderCameraTilePos.locV > 0)and(c+gRenderCameraTilePos.locV <= gLOprops.size.locV)then
        ps = point(q,c)+gRenderCameraTilePos
        
        tp = gLEProps.matrix[ps.loch][ps.locV][layer][1]
        
        
        repeat with t in gLEProps.matrix[ps.locH][ps.locV][layer][2] then
          case t of
            1:
              rct = rect((q-1)*20, (c-1)*20, q*20, c*20)+rect(0, 8, 0, -8)--rect(gRenderCameraTilePos,gRenderCameraTilePos)*20
              mdlFrntImg.copyPixels(member("pxl").image, rct, member("pxl").image.rect, {color:poleCol})
            2:
              rct = rect((q-1)*20, (c-1)*20, q*20, c*20)+rect(8, 0, -8, 0)--rect(gRenderCameraTilePos,gRenderCameraTilePos)*20
              mdlFrntImg.copyPixels(member("pxl").image, rct, member("pxl").image.rect, {color:poleCol})
            3:
              -- rct = rect((q-1)*20, (c-1)*20, q*20, c*20)--+rect(0, 8, 0, -8)
              --   mdlFrntImg.copyPixels(member("hiveGrass").image, rct, member("hiveGrass").image.rect, {color:pltt[1]})
            4:
              tp = 1
          end case
        end repeat
        
        --drawATile(q, c, layer)
        --  put gLEProps.matrix[q][c][layer][1]
        if (gLEProps.matrix[ps.locH][ps.locV][1][1] = 7)and(layer=1) then
          shortCutEntrences.add([random(1000), ps.locH, ps.locV])
        else
          
          if gLEProps.matrix[ps.locH][ps.locV][1][2].getPos(5)<>0 then
            if layer = 1 then
              if gLEProps.matrix[ps.locH][ps.locV][1][1]=1 then
                if ["material", "default"].getPos(gTEprops.tlMatrix[ps.locH][ps.locV][layer].tp) <> 0 then
                  shortCuts.add(point(ps.locH,ps.locV))
                end if
              end if 
            else if layer = 2 then
              if gLEProps.matrix[ps.locH][ps.locV][2][1]=1 then
                if gLEProps.matrix[ps.locH][ps.locV][1][1]<>1 then
                  if ["material", "default"].getPos(gTEprops.tlMatrix[ps.locH][ps.locV][layer].tp) <> 0 then
                    shortCuts.add(point(ps.locH,ps.locV))
                  end if
                end if 
              end if
            end if
          end if
          
          if gTEprops.tlMatrix[ps.locH][ps.locV][layer].tp = "tileHead" then
            dt = gTEprops.tlMatrix[ps.locH][ps.locV][layer].data
            if (gTiles[dt[1].locH].tls[dt[1].locV].tags.getPos("drawLast")<>0) then
              drawLastTiles.add([random(999), ps.locH, ps.locV])
            else
              drawLaterTiles.add([random(999), ps.locH, ps.locV])
            end if
          else if gTEprops.tlMatrix[ps.locH][ps.locV][layer].tp <> "tileBody" then
            drawLaterTiles.add([random(999), ps.locH, ps.locV])
          end if
          
        end if
        
        
      end if
    end repeat
  end repeat
  
  
  drawLaterTiles.sort()
  drawMaterials = []
  indxer = []
  repeat with q = 1 to gTiles[1].tls.count then
    indxer.add(gTiles[1].tls[q].nm)
    drawMaterials.add([gTiles[1].tls[q].nm, [], gTiles[1].tls[q].renderType])
  end repeat
  
  
  repeat with tl in drawLaterTiles then
    savSeed = the randomSeed
    global gLOprops
    the randomSeed = seedForTile(point(tl[2], tl[3]), gLOprops.tileSeed + layer)
    case gTEprops.tlMatrix[tl[2]][tl[3]][layer].tp of
      "material":
        drawMaterials[indxer.getPos(gTEprops.tlMatrix[tl[2]][tl[3]][layer].data)][2].add(tl)
      "default":
        drawMaterials[indxer.getPos(gTEprops.defaultMaterial)][2].add(tl)
      "tileHead":
        dt = gTEprops.tlMatrix[(tl[2])][(tl[3])][layer].data
        frntImg = drawATileTile(tl[2],tl[3],layer,gTiles[dt[1].locH].tls[dt[1].locV], frntImg, dt)
    end case
    the randomSeed = savSeed
  end repeat
  
  repeat with q = 1 to drawMaterials.count then
    savSeed = the randomSeed
    global gLOprops
    the randomSeed = gLOprops.tileSeed + layer
    if(drawMaterials[q][2].count > 0) then
      case drawMaterials[q][3] of
        "unified":
          repeat with tl in drawMaterials[q][2] then
            frntImg = drawATileMaterial(tl[2], tl[3], layer, drawMaterials[q][1], frntImg)
          end repeat
        "tiles":
          frntImg = renderTileMaterial(layer, drawMaterials[q][1], frntImg)
          
        "pipeType":
          repeat with tl in drawMaterials[q][2] then
            -- frntImg = drawATileMaterial(tl[2], tl[3], layer, pltt, drawTiles[q][1], frntImg)
            if afaMvLvlEdit(point(tl[2], tl[3]), layer)<>0 then
              drawPipeTypeTile(drawMaterials[q][1], point(tl[2], tl[3]), layer)
            end if
          end repeat
          
        "largeTrashType":
          repeat with tl in drawMaterials[q][2] then
            if afaMvLvlEdit(point(tl[2], tl[3]), layer)=1 then
              drawLargeTrashTypeTile(drawMaterials[q][1], point(tl[2], tl[3]), layer, frntImg)
            end if
          end repeat
          
        "ridgeType":
          repeat with tl in drawMaterials[q][2] then
            if afaMvLvlEdit(point(tl[2], tl[3]), layer)=1 then
              drawRidgeTypeTile(drawMaterials[q][1], point(tl[2], tl[3]), layer, frntImg)
            end if
          end repeat
          
        "dirtType":
          repeat with tl in drawMaterials[q][2] then
            if afaMvLvlEdit(point(tl[2], tl[3]), layer)=1 then
              drawDirtTypeTile(drawMaterials[q][1], point(tl[2], tl[3]), layer, frntImg)
            end if
          end repeat
          
        "densePipeType":
          repeat with tl in drawMaterials[q][2] then
            if afaMvLvlEdit(point(tl[2], tl[3]), layer)<>0 then
              drawDPTTile(drawMaterials[q][1], point(tl[2], tl[3]), layer, frntImg)
            end if
          end repeat
          
        "ceramicType":
          repeat with tl in drawMaterials[q][2] then
            if afaMvLvlEdit(point(tl[2], tl[3]), layer)=1 then
              drawCeramicTypeTile(drawMaterials[q][1], point(tl[2], tl[3]), layer, frntImg)
            else if(point(tl[2], tl[3]).inside(rect(gRenderCameraTilePos, gRenderCameraTilePos+point(100, 60)))) then
              frntImg = drawATileMaterial(tl[2], tl[3], layer, "Standard", frntImg)
            end if
          end repeat
      end case
    end if
    the randomSeed = savSeed
  end repeat
  
  
  
  
  --shortCuts.sort()
  repeat with tl in shortCuts then
    if (shortCuts.getPos(tl+point(-1,0))>0)and((shortCuts.getPos(tl+point(1,0))>0))then
      drawATileTile(tl.locH, tl.locV, layer,  [#nm:"shortCutHorizontal", #sz:point(1,1), #specs:[], #specs2:void, #tp:"voxelStruct", #repeatL:[1, 9], #bfTiles:0, #rnd:1, #ptPos:0, #tags:[]], frntImg)
    else if (shortCuts.getPos(tl+point(0,-1))>0)and((shortCuts.getPos(tl+point(0,1))>0))then
      drawATileTile(tl.locH, tl.locV, layer,  [#nm:"shortCutVertical", #sz:point(1,1), #specs:[], #specs2:void, #tp:"voxelStruct", #repeatL:[1, 9], #bfTiles:0, #rnd:1, #ptPos:0, #tags:[]], frntImg)
    else
      drawATileTile(tl.locH, tl.locV, layer,  [#nm:"shortCutTile", #sz:point(1,1), #specs:[], #specs2:void, #tp:"voxelStruct", #repeatL:[1, 9], #bfTiles:0, #rnd:1, #ptPos:0, #tags:[]], frntImg)
    end if
  end repeat
  
  repeat with tl in drawLastTiles then
    dt = gTEprops.tlMatrix[(tl[2])][(tl[3])][layer].data
    frntImg = drawATileTile(tl[2],tl[3],layer,gTiles[dt[1].locH].tls[dt[1].locV], frntImg)
  end repeat
  
  global gShortcuts
  shortCutEntrences.sort()
  repeat with tl in shortCutEntrences then
    -- frntImg = drawAShortCut(tl[2], tl[3], layer, pltt, frntImg)
    -- put gShortcuts
    tp = "shortCut"
    if gShortcuts.indexL.getPos(point(tl[2], tl[3])-gRenderCameraTilePos)>0 then
      tp = gShortcuts.scs[gShortcuts.indexL.getPos(point(tl[2], tl[3])-gRenderCameraTilePos)]
    end if
    
    mem = "shortCut"
    if tp = "shortCut" then
      mem = "shortCutArrows"
    else if tp = "playerHole" then
      mem = "shortCutDots"
    end if
    
    drawATileTile(tl[2], tl[3], 1, [#nm:mem, #sz:point(3,3), #specs:[], #specs2:[], #tp:"voxelStruct", #repeatL:[1,7,12], #bfTiles:1, #rnd:-1, #ptPos:0, #tags:[]], frntImg)
    
  end repeat
  
  
  
  --  repeat with q = dpt to dpt+9 then
  --    member("layer"&string(q)).image.copyPixels(frntImg,rect(0,0,1040,800), rect(0,0,1040,800), {#ink:36})
  --  end repeat
  
  repeat with q = 0 to cols then
    drawVerticalSurface(q, dpt)
  end repeat
  repeat with q = 0 to rows then
    drawHorizontalSurface(q, dpt)
  end repeat
  
  
  
  member("layer"&string(dpt+5)).image.copyPixels(mdlBckImg, mdlBckImg.rect, mdlBckImg.rect, {#ink:36})
  member("layer"&string(dpt)).image.copyPixels(frntImg, frntImg.rect, frntImg.rect, {#ink:36})
  
  
  --ADD CRACKS
  d = 0
  if layer = 2 then
    d = 10
  else if layer = 3 then
    d = 20
  end if
  repeat with q = 1 to cols then
    repeat with c = 1 to rows then
      q2 = q + gRenderCameraTilePos.locH
      c2 = c + gRenderCameraTilePos.locV
      
      if(q2 > 1)and(q2 < gLOprops.size.locH)and(c2 > 1)and(c2 < gLOprops.size.locV)then
        if (gLEProps.matrix[q2][c2][layer][2].getPos(11) > 0)then
          rct = rect((q-1)*20, (c-1)*20, q*20, c*20)
          if (gLEProps.matrix[q2-1][c2][layer][2].getPos(11)>0)or(gLEProps.matrix[q2-1][c2][layer][1]=0)or(gLEProps.matrix[q2+1][c2][layer][2].getPos(11)>0)or(gLEProps.matrix[q2+1][c2][layer][1]=0)then
            rct = rct+rect(-10, 0, 10, 0)  
          else
            rct = rct+rect(5, 0, -5, 0)
          end if
          if (gLEProps.matrix[q2][c2-1][layer][2].getPos(11)>0)or(gLEProps.matrix[q2][c2-1][layer][1]=0)or(gLEProps.matrix[q2][c2+1][layer][2].getPos(11)>0)or(gLEProps.matrix[q2][c2+1][layer][1]=0)then
            rct = rct+rect(0, -10, 0, 10)
          else
            rct = rct+rect(0, 5, 0, -5)
          end if
          
          repeat with dir in [point(-1,0), point(0,-1),point(1,0),point(0,1)] then
            if (gLEProps.matrix[q2+dir.locH][c2+dir.locV][layer][1] <> 1)then
              repeat with z = d to d+8 then
                repeat with r = 1 to 3 then
                  rnd = random(4)
                  member("layer"&string(z)).image.copyPixels(member("rubbleGraf"&string(rnd)).image, rect((q-1)*20, (c-1)*20, q*20, c*20)+rect(dir*10, dir*10)+rect(random(3)-random(8)+(z-d), random(3)-random(8)+(z-d), random(8)-random(3)-(z-d), random(8)-random(3)-(z-d)), member("rubbleGraf"&string(rnd)).image.rect, {#color:color(255,255,255), #ink:36})
                end repeat  
              end repeat  
            end if
          end repeat
          
          repeat with z = d to d+8 then
            repeat with r = 1 to 4 then
              if ((random(8)>(z-d))and(random(3)>1))or(random(5)=1) then
                rnd = random(4)
                member("layer"&string(z)).image.copyPixels(member("rubbleGraf"&string(rnd)).image, rct+rect(random(8)-random(8)+(z-d), random(8)-random(8)+(z-d), random(8)-random(8)-(z-d), random(8)-random(8)-(z-d)), member("rubbleGraf"&string(rnd)).image.rect, {#color:color(255,255,255), #ink:36})
              end if              
            end repeat
          end repeat
          
        end if
      end if
    end repeat
  end repeat
  
  -- POLES ADDED AFTER CRACKS
  member("layer"&string(dpt+4)).image.copyPixels(mdlFrntImg, mdlFrntImg.rect, mdlFrntImg.rect, {#ink:36})
  --  --ADD POLES (AGAIN)
  --  repeat with q = 1 to 52 then
  --    repeat with c = 1 to 40 then
  --      repeat with t in gLEProps.matrix[q][c][layer][2] then
  --        case t of
  --          1:
  --            rct = rect((q-1)*20, (c-1)*20, q*20, c*20)+rect(0, 8, 0, -8)
  --            mdlFrntImg.copyPixels(member("pxl").image, rct, member("pxl").image.rect, {color:poleCol})
  --          2:
  --            rct = rect((q-1)*20, (c-1)*20, q*20, c*20)+rect(8, 0, -8, 0)
  --            mdlFrntImg.copyPixels(member("pxl").image, rct, member("pxl").image.rect, {color:poleCol})
  --            --   3:
  --            -- rct = rect((q-1)*20, (c-1)*20, q*20, c*20)--+rect(0, 8, 0, -8)
  --            --   mdlFrntImg.copyPixels(member("hiveGrass").image, rct, member("hiveGrass").image.rect, {color:pltt[1]})
  --            --  4:
  --            --    tp = 1
  --        end case
  --      end repeat
  --    end repeat
  --  end repeat
end

on checkIfATileIsSolidAndSameMaterial(tl, lr, mat)
  tl = point(restrict(tl.locH,1,gLOprops.size.loch), restrict(tl.locV,1,gLOprops.size.locv))
  rtrn = 0
  if gLEprops.matrix[tl.locH][tl.locV][lr][1] = 1 then
    if (gTEprops.tlMatrix[tl.locH][tl.locV][lr].tp = "material")and(gTEprops.tlMatrix[tl.locH][tl.locV][lr].data = mat) then
      rtrn = 1
    else  if (gTEprops.tlMatrix[tl.locH][tl.locV][lr].tp = "default")and(gTEprops.defaultMaterial = mat) then
      rtrn = 1
    end if 
  end if 
  return rtrn
end

on drawATileMaterial(q, c, l, mat, frntImg)
  if l = 1 then
    dp = 0
  else if l = 2 then
    dp = 10
  else
    dp = 20
  end if
  rct = rect((q-1)*20, (c-1)*20, q*20, c*20)
  
  myTileSet = tileSetIndex.getPos(mat)
  
  case gLEProps.matrix[q][c][l][1] of
    1:
      repeat with f = 1 to 4 then
        case f of
          1:
            profL = [point(-1, 0), point(0, -1)]
            gtAtV = 2
            pstRect = rct + rect(0,0,-10, -10)
          2:
            profL = [point(1, 0), point(0, -1)]
            gtAtV = 4
            pstRect = rct + rect(10,0,0, -10)
          3:
            profL = [point(1, 0), point(0, 1)]
            gtAtV = 6
            pstRect = rct + rect(10,10,0,0)
          otherwise:
            profL = [point(-1, 0), point(0, 1)]
            gtAtV = 8
            pstRect = rct + rect(0,10,-10,0)
        end case
        ID = ""
        repeat with dr in profL then
          ID = ID & string( isMyTileSetOpenToThisTile(mat, point(q,c)+dr, l))
        end repeat
        if ID = "11" then
          if (       [1,2,3,4,5].getpos(isMyTileSetOpenToThisTile(mat, point(q,c)+profL[1]+profL[2], l)) > 0        )then
            gtAtH = 10
            gtAtV = 2
          else
            gtAtH = 8
          end if
        else
          gtAtH = [0, "00", 0, "01", 0, "10"].getPos(ID)
        end if
        if gtAtH = 4 then
          if gtAtV = 6 then
            gtAtV = 4
          else if gtAtV = 8 then
            gtAtV = 2
          end if
        else if gtAtH = 6 then
          if (gtAtV = 4)or(gtAtV = 8) then
            gtAtV = gtAtV - 2
          end if
        end if
        gtRect = rect((gtAtH-1)*10, (gtAtV-1)*10, gtAtH*10, gtAtV*10)+rect(-5,-5, 5, 5)
        pstRect = pstRect - rect(gRenderCameraTilePos, gRenderCameraTilePos)*20
        
        --  member("layer"&string(dp)).image.copyPixels(member("tileSet"&string(myTileSet)).image, pstRect+rect(-5,-5, 5, 5), gtRect, {#ink:36})
        frntImg.copyPixels(member("tileSet"&string(myTileSet)).image, pstRect+rect(-5,-5, 5, 5), gtRect, {#ink:36})
        
        
        
        repeat with d = dp+1 to dp+9 then
          member("layer"&string(d)).image.copyPixels(member("tileSet"&string(myTileSet)).image, pstRect+rect(-5,-5, 5, 5), gtRect+rect(120, 0, 120, 0), {#ink:36})
        end repeat
      end repeat
      
    2,3,4,5:
      slp = gLEProps.matrix[q][c][l][1]
      askDirs = [0, [point(-1, 0), point(0, 1)], [point(1, 0), point(0, 1)], [point(-1, 0), point(0, -1)], [point(1, 0), point(0, -1)]]
      myAskDirs = askDirs[slp]
      pstRect = rect((q-1)*20, (c-1)*20, q*20, c*20) - rect(gRenderCameraTilePos, gRenderCameraTilePos)*20
      
      repeat with ad = 1 to myAskDirs.count then
        gtRect = rect(10, 90, 30, 110) + rect(60*(ad=2), 30*(slp-2), 60*(ad=2), 30*(slp-2))
        if isMyTileSetOpenToThisTile(mat, point(q,c)+myAskDirs[ad], l) then
          gtRect = gtRect + rect(30, 0, 30, 0)
        end if
        --  member("layer"&string(dp)).image.copyPixels(member("tileSet"&string(myTileSet)).image, pstRect+rect(-5,-5, 5, 5), gtRect+rect(-5,-5, 5, 5), {#ink:36})
        
        if(mat = "Scaffolding")then
          repeat with d = dp+5 to dp+6 then
            member("layer"&string(d)).image.copyPixels(member("tileSet"&string(myTileSet)).image, pstRect+rect(-5,-5, 5, 5), gtRect+rect(-5,-5, 5, 5)+rect(120, 0, 120, 0), {#ink:36})
          end repeat
          repeat with d = dp+8 to dp+9 then
            member("layer"&string(d)).image.copyPixels(member("tileSet"&string(myTileSet)).image, pstRect+rect(-5,-5, 5, 5), gtRect+rect(-5,-5, 5, 5)+rect(120, 0, 120, 0), {#ink:36})
          end repeat
        else
          frntImg.copyPixels(member("tileSet"&string(myTileSet)).image, pstRect+rect(-5,-5, 5, 5), gtRect+rect(-5,-5, 5, 5), {#ink:36})
          
          repeat with d = dp+1 to dp+9 then
            member("layer"&string(d)).image.copyPixels(member("tileSet"&string(myTileSet)).image, pstRect+rect(-5,-5, 5, 5), gtRect+rect(-5,-5, 5, 5)+rect(120, 0, 120, 0), {#ink:36})
          end repeat
        end if
        
      end repeat
      
    6:
      
      drawATileTile(q, c, l, [#nm:"tileSet"&string(mat)&"floor", #sz:point(1,1), #specs:[], #specs2:void, #tp:"voxelStruct", #repeatL:[6,1,1,1,1], #bfTiles:1, #rnd:1, #ptPos:0, #tags:[]], frntImg)
      
  end case
  
  if ["Concrete","RainStone", "Bricks", "Tiny Signs"].getPos(mat)>0 then
    matInt = ["Concrete","RainStone", "Bricks", "Tiny Signs"].getPos(mat)
    modder = [45, 6, 1, 10][matInt]
    
    gtRect = rect((q mod modder)*20, (c mod modder)*20, ((q mod modder)+1)*20, ((c mod modder)+1)*20)
    if mat = "Bricks" then
      gtRect = rect(0,0,20,20)
    end if
    if (mat = "Tiny Signs") and (gTinySignsDrawn=0)then
      drawTinySigns()
      gTinySignsDrawn = 1
    end if
    case gLEProps.matrix[q][c][l][1] of
      1:
        
        pstRect = rect((q-1)*20, (c-1)*20, q*20, c*20) - rect(gRenderCameraTilePos, gRenderCameraTilePos)*20
        --put mat&"Texture"
        -- put member(mat&"Texture")
        member("layer"&string(dp)).image.copyPixels(member(mat&"Texture").image, pstRect, gtRect, {#ink:36})
        
      2,3,4,5:
        member("layer"&string(dp)).image.copyPixels(member(mat&"Texture").image, pstRect, gtRect, {#ink:36})
        case gLEProps.matrix[q][c][l][1] of
          5:--2:
            rct = rect((q-1)*20, (c-1)*20, q*20, c*20)
            rct = [point(rct.left, rct.top), point(rct.left, rct.top), point(rct.right, rct.bottom), point(rct.left, rct.bottom)]
          4:--3:
            rct = rect((q-1)*20, (c-1)*20, q*20, c*20)
            rct = [point(rct.right, rct.top), point(rct.right, rct.top), point(rct.left, rct.bottom), point(rct.right, rct.bottom)]
          3:--4:
            rct = rect((q-1)*20, (c-1)*20, q*20, c*20)
            rct = [point(rct.left, rct.bottom), point(rct.left, rct.bottom), point(rct.right, rct.top), point(rct.left, rct.top)]
          2:--5:
            rct = rect((q-1)*20, (c-1)*20, q*20, c*20)
            rct = [point(rct.right, rct.bottom), point(rct.right, rct.bottom), point(rct.left, rct.top), point(rct.right, rct.top)]
        end case
        rct = rct - [gRenderCameraTilePos, gRenderCameraTilePos, gRenderCameraTilePos, gRenderCameraTilePos]*20
        member("layer"&string(dp)).image.copyPixels(member("pxl").image, rct, rect(0,0,1,1), {#color:color(255,255,255)})
    end case
  end if
  
  return frntImg
end


on isMyTileSetOpenToThisTile(mat, tl, l)
  global gLOprops
  rtrn = 0
  if tl.inside(rect(1,1,gLOprops.size.loch+1,gLOprops.size.locv+1))then
    if [1,2,3,4,5].getPos(gLEProps.matrix[tl.locH][tl.locV][l][1]) > 0 then
      if (gTEprops.tlMatrix[tl.locH][tl.locV][l].tp = "material")and(gTEprops.tlMatrix[tl.locH][tl.locV][l].data = mat) then
        rtrn = 1
      else if (gTEprops.tlMatrix[tl.locH][tl.locV][l].tp = "default")and(gTEprops.defaultMaterial=mat) then
        rtrn = 1
      end if
    end if
  else
    if gTEprops.defaultMaterial=mat then
      rtrn = 1
    end if
  end if
  return rtrn
end


on drawATileTile(q, c, l, tl, frntImg, dt)
  
  
  sav2 = member("previewImprt")
  if gLastImported <> tl.nm then
    member("previewImprt").importFileInto("Graphics\" &tl.nm&".png")
    sav2.name = "previewImprt"
    gLastImported = tl.nm
  end if
  
  
  
  q = q - gRenderCameraTilePos.locH
  c = c - gRenderCameraTilePos.locV
  
  
  
  
  
  mdPnt = point(((tl.sz.locH*0.5)+0.4999).integer,((tl.sz.locV*0.5)+0.4999).integer)
  strt = point(q,c)-mdPnt+point(1,1)
  
  case tl.tp of
    "box":
      
      nmOfTiles = tl.sz.locH*tl.sz.locV
      
      
      n = 1
      repeat with g = strt.locH to strt.locH + tl.sz.locH-1 then
        repeat with h = strt.locV to strt.locV + tl.sz.locV-1 then
          rct = rect((g-1)*20, (h-1)*20, (g*20), (h*20)) 
          getrct = rect(20, (n-1)*20, 40, n*20)
          member("vertImg").image.copyPixels(sav2.image, rct, getrct, {#ink:36})
          getrct = rect(0, (n-1)*20, 20, n*20)
          member("horiImg").image.copyPixels(sav2.image, rct, getrct, {#ink:36})
          n = n + 1  
        end repeat
      end repeat
      rct = rect(strt*20, (strt+tl.sz)*20)+rect(-20*tl.bfTiles, -20*tl.bfTiles, 20*tl.bfTiles, 20*tl.bfTiles)+rect(-20, -20, -20, -20)
      getRect = rect(0,0,tl.sz.locH*20, tl.sz.locV*20)+rect(0,0,40*tl.bfTiles, 40*tl.bfTiles)+rect(0,nmOfTiles*20,0,nmOfTiles*20)
      rnd = random(tl.rnd)
      getRect = getRect + rect(getRect.width*(rnd-1), 0, getRect.width*(rnd-1), 0)
      frntImg.copyPixels(sav2.image, rct, getRect, {#ink:36})
      
      
    "voxelStruct":
      
      if l = 1 then
        dp = 0
      else if l = 2 then
        dp = 10
      else
        dp = 20
      end if
      
      rct = rect(strt*20, (strt+tl.sz)*20)+rect(-20*tl.bfTiles, -20*tl.bfTiles, 20*tl.bfTiles, 20*tl.bfTiles)+rect(-20, -20, -20, -20)
      gtRect = rect(0,0,(tl.sz.locH*20)+(40*tl.bfTiles), (tl.sz.locV*20)+(40*tl.bfTiles))
      
      if tl.rnd = -1 then
        rnd = 1
        
        repeat with dir in [point(-1, 0), point(0, -1), point(1, 0), point(0, 1)] then
          if [0,6].getPos(afaMvLvlEdit(point(q,c)+dir+gRenderCameraTilePos, 1))<>0 then
            exit repeat
          else
            rnd = rnd + 1
          end if
        end repeat
        
      else
        rnd = random(tl.rnd)
      end if
      
      if tl.tags.getPos("ramp")<> 0 then
        rnd = 2
        if (afaMvLvlEdit(point(q,c)+gRenderCameraTilePos, 1)=3) then
          rnd = 1
        end if
      end if
      
      frntImg.copyPixels(sav2.image, rct, gtRect + rect(gtRect.width*(rnd-1), 0, gtRect.width*(rnd-1), 0)+rect(0,1,0,1), {#ink:36})
      
      
      d = -1
      repeat with ps = 1 to tl.repeatL.count then
        repeat with ps2 = 1 to tl.repeatL[ps] then
          d = d + 1  
          if d+dp > 29 then
            exit repeat
          else
            member("layer"&string(d+dp)).image.copyPixels(sav2.image, rct, gtRect + rect(gtRect.width*(rnd-1),gtRect.height*(ps-1), gtRect.width*(rnd-1), gtRect.height*(ps-1))+rect(0,1,0,1), {#ink:36})
          end if
        end repeat
      end repeat
      
    "voxelStructRandomDisplaceHorizontal", "voxelStructRandomDisplaceVertical":
      
      if l = 1 then
        dp = 0
      else if l = 2 then
        dp = 10
      else
        dp = 20
      end if
      
      rct = rect(strt*20, (strt+tl.sz)*20)+rect(-20*tl.bfTiles, -20*tl.bfTiles, 20*tl.bfTiles, 20*tl.bfTiles)+rect(-20, -20, -20, -20)
      gtRect = rect(0,0,(tl.sz.locH*20)+(40*tl.bfTiles), (tl.sz.locV*20)+(40*tl.bfTiles))
      
      -- rnd = 1
      
      seed = the randomSeed
      global gLOprops
      
      if tl.tp = "voxelStructRandomDisplaceVertical" then
        the randomSeed = gLOprops.tileSeed + q
        dsplcPoint = random(gtRect.height)
        gtRect1 = rect(gtRect.left, gtRect.top, gtRect.right, gtRect.top+dsplcPoint)
        gtRect2 = rect(gtRect.left, gtRect.top+dsplcPoint, gtRect.right, gtRect.bottom)
        rct1 = rect(rct.left, rct.bottom-dsplcPoint, rct.right, rct.bottom)
        rct2 = rect(rct.left, rct.top, rct.right, rct.bottom-dsplcPoint)
      else
        the randomSeed = gLOprops.tileSeed + c
        dsplcPoint = random(gtRect.width)
        gtRect1 = rect(gtRect.left, gtRect.top, gtRect.left+dsplcPoint, gtRect.bottom)
        gtRect2 = rect(gtRect.left+dsplcPoint, gtRect.top, gtRect.right, gtRect.bottom)
        rct1 = rect(rct.right-dsplcPoint, rct.top, rct.right, rct.bottom)
        rct2 = rect(rct.left, rct.top, rct.right-dsplcPoint, rct.bottom)
      end if
      the randomSeed = seed
      
      frntImg.copyPixels(sav2.image, rct1, gtRect1 +rect(0,1,0,1), {#ink:36})
      frntImg.copyPixels(sav2.image, rct2, gtRect2 +rect(0,1,0,1), {#ink:36})
      
      
      d = -1
      repeat with ps = 1 to tl.repeatL.count then
        repeat with ps2 = 1 to tl.repeatL[ps] then
          d = d + 1  
          if d+dp > 29 then
            exit repeat
          else
            member("layer"&string(d+dp)).image.copyPixels(sav2.image, rct1, gtRect1 + rect(0,gtRect.height*(ps-1), 0, gtRect.height*(ps-1))+rect(0,1,0,1), {#ink:36})
            member("layer"&string(d+dp)).image.copyPixels(sav2.image, rct2, gtRect2 + rect(0,gtRect.height*(ps-1), 0, gtRect.height*(ps-1))+rect(0,1,0,1), {#ink:36})
          end if
        end repeat
      end repeat
      
    "voxelStructRockType":
      if l = 1 then
        dp = 0
      else if l = 2 then
        dp = 10
      else
        dp = 20
      end if
      rct = rect(strt*20, (strt+tl.sz)*20)+rect(-20*tl.bfTiles, -20*tl.bfTiles, 20*tl.bfTiles, 20*tl.bfTiles)+rect(-20, -20, -20, -20)
      gtRect = rect(0,0,(tl.sz.locH*20)+(40*tl.bfTiles), (tl.sz.locV*20)+(40*tl.bfTiles))
      
      
      rnd = random(tl.rnd)
      
      repeat with d = dp to restrict(dp+9+(10*(tl.specs2 <> void)), 0, 29) then
        if [12, 8, 4].getPos(d) then
          rnd = random(tl.rnd)
        end if
        member("layer"&string(d)).image.copyPixels(sav2.image, rct, gtRect + rect(gtRect.width*(rnd-1), 0, gtRect.width*(rnd-1), 0)+rect(0,1,0,1), {#ink:36})
        
      end repeat
      
  end case
  
  repeat with tag in tl.tags then
    case tag of
      "Chain Holder":
        if (dt.count > 2)then
          if (dt[3] <> "NONE") then
            ps1 = giveMiddleOfTile(point(q,c))+point(10.1,10.1)
            ps2 = giveMiddleOfTile(dt[3]-gRenderCameraTilePos)+point(10.1,10.1)
            
            if l = 1 then
              dp = 2
            else if l = 2 then
              dp = 12
            else
              dp = 22
            end if
            
            global gLOProps
            
            steps = ((diag(ps1, ps2)/12.0)+0.4999).integer
            dr = moveToPoint(ps1, ps2, 1.0)
            ornt = random(2)-1
            degDir = lookatpoint(ps1, ps2)
            stp = random(100)*0.01
            repeat with q = 1 to steps then
              pos = ps1+(dr*12*(q-stp))
              if ornt then
                --   pos = (pnt+lastPnt)*0.5
                rct = rect(pos,pos)+rect(-6,-10,6,10)
                gtRect = rect(0,0,12,20)
                ornt = 0
              else
                -- pos = (pnt+lastPnt)*0.5
                rct = rect(pos,pos)+rect(-2,-10,2,10)
                gtRect = rect(13,0,16,20)
                ornt = 1
              end if
              -- put rct
              member("layer"&string(dp)).image.copypixels(member("bigChainSegment").image, rotateToQuad(rct, degDir), gtRect, {#color:gLOProps.pals[gLOProps.pal].detCol, #ink:36})
              -- member("layer"&string(dp)).image.copypixels(member("bigChainSegment").image, rct, member("bigChainSegment").image.rect, {#color:color(255,0,0), #ink:36})
            end repeat
            
          end if
        end if
        
      "fanBlade":
        if l = 1 then
          dp = 10
        else if l = 2 then
          dp = 20
        else
          dp = 25
        end if
        rct = rect(-23,-23,23,23)+rect(giveMiddleOfTile(point(q,c)), giveMiddleOfTile(point(q,c)))
        -- dp = 1
        member("layer"&string(dp-2)).image.copyPixels(member("fanBlade").image, rotateToQuad(rct, random(360)), member("fanBlade").image.rect, {#ink:36, #color:color(0,255,0)})
        
        member("layer"&string(dp)).image.copyPixels(member("fanBlade").image, rotateToQuad(rct, random(360)), member("fanBlade").image.rect, {#ink:36, #color:color(0,255,0)})
        
      "Big Wheel":
        if l = 1 then
          dpsL = [0, 7]
        else if l = 2 then
          dpsL = [9, 17]
        else
          dpsL = [19, 27]
        end if
        rct = rect(-90,-90,90,90)+rect(giveMiddleOfTile(point(q,c))+point(10,10), giveMiddleOfTile(point(q,c))+point(10,10))
        -- dp = 1
        repeat with dp1 in dpsL then
          rnd = random(360)
          repeat with dp in [dp1, dp1+1, dp1+2] then
            member("layer"&string(dp)).image.copyPixels(member("Big Wheel Graf").image, rotateToQuad(rct, rnd+0.001), member("Big Wheel Graf").image.rect, {#ink:36, #color:color(0,255,0)})
          end repeat
        end repeat
        
        
      "randomCords":
        if l = 1 then
          dp = random(9)
        else if l = 2 then
          dp = 10+random(9)
        else
          dp = 20+random(9)
        end if
        -- put tl
        pnt = giveMiddleOfTile(point(q,c+(tl.sz.locV/2)))-- + point(-0.5*tl.sz.locH+random(tl.sz.locH), 0)
        rct = rect(-50,-50,50,50)+rect(pnt, pnt)
        -- dp = 1
        --  member("layer"&string(dp-2)).image.copyPixels(member("fanBlade").image, rotateToQuad(rct, random(360)), member("fanBlade").image.rect, {#ink:36, #color:color(0,255,0)})
        rnd = random(7)
        member("layer"&string(dp)).image.copyPixels(member("randomCords").image, rotateToQuad(rct, -30+random(60)), rect((rnd-1)*100, 0, rnd*100, 100)+rect(1,1,1,1), {#ink:36})
        
      "Big Sign":
        -- put "BIG SIGN"
        img = image(60,60,1)
        rnd = random(20)
        rct = rect(3,3,29,33)
        img.copyPixels(member("bigSigns1").image, rct, rect((rnd-1)*26, 0, rnd*26, 30), {#ink:36, #color:color(0,0, 0)})
        rnd = random(20)
        rct = rect(3+28,3,29+28,33)
        img.copyPixels(member("bigSigns1").image, rct, rect((rnd-1)*26, 0, rnd*26, 30), {#ink:36, #color:color(0,0, 0)})
        rnd = random(14)
        rct = rect(3,35,3+55,35+24)
        img.copyPixels(member("bigSigns2").image, rct, rect((rnd-1)*55, 0, rnd*55, 24), {#ink:36, #color:color(0,0,0)})
        
        repeat with r in [[point(-4,-4), color(0,0,255)],[point(-3,-3), color(0,0,255)],[point(3,3), color(255,0,0)],[point(4,4), color(255,0,0)], [point(-2,-2), color(0,255,0)], [point(-1,-1), color(0,255,0)], [point(0,0), color(0,255,0)], [point(1,1), color(0,255,0)], [point(2,2), color(0,255,0)], [point(2,2), color(0,255,0)]] then
          frntImg.copyPixels(img, rect(-30,-30,30,30)+rect(giveMiddleOfTile(point(q,c)), giveMiddleOfTile(point(q,c)))+rect(r[1],r[1]), rect(0,0,60,60), {#ink:36, #color:r[2]})
        end repeat
        
        
        
        if l = 1 then
          dp = 0
        else if l = 2 then
          dp = 10
        else
          dp = 20
        end if
        
        frntImg.copyPixels(img, rect(-30,-30,30,30)+rect(giveMiddleOfTile(point(q,c)), giveMiddleOfTile(point(q,c))), rect(0,0,60,60), {#ink:36, #color:color(255,0,255)})
        --member("layer"&string(dp-1)).image.copyPixels(img, rect(-30,-30,30,30)+rect(giveMiddleOfTile(point(q,c)), giveMiddleOfTile(point(q,c))), rect(0,0,60,60), {#ink:36, #color:color(255,255,255)})
        --member("layer"&string(dp)).image.copyPixels(img, rect(-30,-30,30,30)+rect(giveMiddleOfTile(point(q,c)), giveMiddleOfTile(point(q,c))), rect(0,0,60,60), {#ink:36, #color:color(255,0,255)})
        
        mdPnt = giveMiddleOfTile(point(q,c))--depthPnt(giveMiddleOfTile(point(q,c)), -5+dp)
        
        copyPixelsToEffectColor("A", dp, rect(mdPnt+point(-30,-30),mdPnt+point(30,30)), "bigSignGradient", rect(0, 0, 60, 60), 1, 1.0)
        
        --  
        --  member("gradientA"&string(giveDpFromLr(dp))).image.copyPixels(member("bigSignGradient1").image, rect(mdPnt+point(-30,-30),mdPnt+point(30,30)), rect(0, 0, 60, 60), {#maskImage:member("bigSignGradient").image.createMask()})
        
      "Big Western Sign", "Big Western Sign Tilted":
        img = image(36,48,1)
        rnd = random(20)
        --  rct = rect(3,3,29,33)
        img.copyPixels(member("bigWesternSigns").image, img.rect, rect((rnd-1)*36, 0, rnd*36, 48), {#ink:36, #color:color(0,0, 0)})
        
        
        mdPoint = giveMiddleOfTile(point(q,c))+point(10,0)
        lst = [[point(-4,-4), color(0,0,255)],[point(-3,-3), color(0,0,255)],[point(3,3), color(255,0,0)],[point(4,4), color(255,0,0)],[point(-2,-2), color(0,255,0)], [point(-1,-1), color(0,255,0)], [point(0,0), color(0,255,0)], [point(1,1), color(0,255,0)], [point(2,2), color(0,255,0)], [point(0,0), color(255,0,255)]]
        
        if tag = "Big Western Sign Tilted" then
          tlt = -45.1+random(90)
          repeat with r in lst then
            frntImg.copyPixels(img, rotateToQuad(rect(mdPoint, mdPoint) + rect(-18,-24,18,24) +rect(r[1],r[1]), tlt), rect(0,0,36,48), {#ink:36, #color:r[2]})
          end repeat
        else
          repeat with r in lst then
            frntImg.copyPixels(img, rect(mdPoint, mdPoint) + rect(-18,-24,18,24) +rect(r[1],r[1]), rect(0,0,36,48), {#ink:36, #color:r[2]})
          end repeat
        end if
        
        if l = 1 then
          dp = 0
        else if l = 2 then
          dp = 10
        else
          dp = 20
        end if
        
        --  put dp && giveDpFromLr(dp)
        -- frntImg.copyPixels(img, rect(-30,-30,30,30)+rect(giveMiddleOfTile(point(q,c)), giveMiddleOfTile(point(q,c))), rect(0,0,60,60), {#ink:36, #color:color(255,0,255)})
        
        
        
        -- mdPnt = depthPnt(mdPoint, -5+dp)
        copyPixelsToEffectColor("A", dp, rect(mdPoint+point(-25,-30),mdPoint+point(25,30)), "bigSignGradient", rect(0, 0, 60, 60), 1, 1)
        --member("gradientA"&string(giveDpFromLr(dp))).image.copyPixels(member("bigSignGradient1").image, rect(mdPnt+point(-25,-30),mdPnt+point(25,30)), rect(0, 0, 60, 60), {#maskImage:member("bigSignGradient").image.createMask()})
        
      "Small Asian Sign", "small asian sign on wall":
        img = image(20,20,1)
        rnd = random(14)
        rct = rect(0,1,20,18)
        img.copyPixels(member("smallAsianSigns").image, rct, rect((rnd-1)*20, 0, rnd*20, 17), {#ink:36, #color:color(0,0, 0)})
        
        if tag = "Small Asian Sign" then
          repeat with r in [[point(-4,-4), color(0,0,255)],[point(-3,-3), color(0,0,255)],[point(3,3), color(255,0,0)],[point(4,4), color(255,0,0)], [point(-2,-2), color(0,255,0)], [point(-1,-1), color(0,255,0)], [point(0,0), color(0,255,0)], [point(1,1), color(0,255,0)], [point(2,2), color(0,255,0)], [point(0,0), color(255,0,255)]] then
            frntImg.copyPixels(img, rect(-10,-10,10,10)+rect(giveMiddleOfTile(point(q,c)), giveMiddleOfTile(point(q,c)))+rect(r[1],r[1]), rect(0,0,20,20), {#ink:36, #color:r[2]})
          end repeat
          if l = 1 then
            dp = 0
          else if l = 2 then
            dp = 10
          else
            dp = 20
          end if
          
          mdPnt = giveMiddleOfTile(point(q,c))
          copyPixelsToEffectColor("A", dp, rect(mdPnt+point(-13,-13),mdPnt+point(13,13)), "bigSignGradient", rect(0, 0, 60, 60), 1)
          
        else
          if l = 1 then
            dp = 8
          else if l = 2 then
            dp = 18
          else
            dp = 28
          end if
          repeat with r in [[point(-4,-4), color(0,0,255)],[point(-3,-3), color(0,0,255)],[point(3,3), color(255,0,0)],[point(4,4), color(255,0,0)], [point(-2,-2), color(0,255,0)], [point(-1,-1), color(0,255,0)], [point(0,0), color(0,255,0)], [point(1,1), color(0,255,0)], [point(2,2), color(0,255,0)], [point(0,0), color(255,0,255)]] then
            member("layer"&string(dp)).image.copyPixels(img, rect(-10,-10,10,10)+rect(giveMiddleOfTile(point(q,c)), giveMiddleOfTile(point(q,c)))+rect(r[1],r[1]), rect(0,0,20,20), {#ink:36, #color:r[2]})
            member("layer"&string(dp+1)).image.copyPixels(img, rect(-10,-10,10,10)+rect(giveMiddleOfTile(point(q,c)), giveMiddleOfTile(point(q,c)))+rect(r[1],r[1]), rect(0,0,20,20), {#ink:36, #color:r[2]})
            -- member("layer"&string(dp+2)).image.copyPixels(img, rect(-10,-10,10,10)+rect(giveMiddleOfTile(point(q,c)), giveMiddleOfTile(point(q,c)))+rect(r[1],r[1]), rect(0,0,20,20), {#ink:36, #color:r[2]})
          end repeat
          
          --   mdPnt = depthPnt(giveMiddleOfTile(point(q,c)), -5+dp)
          -- member("gradientA"&string(giveDpFromLr(dp))).image.copyPixels(member("bigSignGradient1").image, rect(mdPnt+point(-13,-13),mdPnt+point(13,13)), rect(0, 0, 60, 60), {#maskImage:member("bigSignGradient").image.createMask()})
          mdPnt = giveMiddleOfTile(point(q,c))
          copyPixelsToEffectColor("A", dp, rect(mdPnt+point(-13,-13),mdPnt+point(13,13)), "bigSignGradient", rect(0, 0, 60, 60), 1, 1)
          
          
        end if
        
      "glass":
        if l = 1 then
          rct = rect(-10*tl.sz.loch,-10*tl.sz.locv,10*tl.sz.loch,10*tl.sz.locv)+rect(giveMiddleOfTile(point(q,c)), giveMiddleOfTile(point(q,c)))
          member("glassImage").image.copyPixels(member("pxl").image, rct, rect(0,0,1,1), {#ink:36})
        end if  
        
      "harvester":
        renderHarvesterDetails(q, c, l, tl, frntImg, dt)
        
      "Temple Floor":
        tileCat = 0
        repeat with a = 1 to gTiles.count then
          if(gTiles[a].nm = "Temple Stone")then
            tileCat = a
            exit repeat
          end if
        end repeat
        
        actualTlPs = point(q,c) + gRenderCameraTilePos
        
        
        
        nextIsFloor = 0
        if(actualTlPs.locH+8 <= gTEProps.tlMatrix.count)then
          if(gTEProps.tlMatrix[actualTlPs.locH+8][actualTlPs.locV][l].tp = "tileHead")then
            if(gTEProps.tlMatrix[actualTlPs.locH+8][actualTlPs.locV][l].data[2] = "Temple Floor")then
              nextIsFloor = 1
            end if
          end if
        end if
        prevIsFloor = 0
        if(actualTlPs.locH-8 > 0)then
          if(gTEProps.tlMatrix[actualTlPs.locH-8][actualTlPs.locV][l].tp = "tileHead")then
            if(gTEProps.tlMatrix[actualTlPs.locH-8][actualTlPs.locV][l].data[2] = "Temple Floor")then
              prevIsFloor = 1
            end if
          end if
        end if
        
        if(prevIsFloor)then
          frntImg = drawATileTile(q+gRenderCameraTilePos.locH-4,c+gRenderCameraTilePos.locV-1,l, gTiles[tileCat].tls[13], frntImg)
        else 
          frntImg = drawATileTile(q+gRenderCameraTilePos.locH-3,c+gRenderCameraTilePos.locV-1,l, gTiles[tileCat].tls[7], frntImg)
        end if
        
        if(nextIsFloor = 0)then
          frntImg = drawATileTile(q+gRenderCameraTilePos.locH+4,c+gRenderCameraTilePos.locV-1,l, gTiles[tileCat].tls[8], frntImg)
        end if
        
        --  drawATileTile(q-4, c-1, l, [#nm:"Temple Stone Wedge", #sz:point(2,1), #specs:[], #specs2:void, #tp:"voxelStruct", #repeatL:[1,1,1,1,6], #bfTiles:0, #rnd:1, #ptPos:0, #tags:[]], frntImg)
        --  drawATileTile(q+4, c-1, l, [#nm:"Temple Stone Wedge", #sz:point(2,1), #specs:[], #specs2:void, #tp:"voxelStruct", #repeatL:[1,1,1,1,6], #bfTiles:0, #rnd:1, #ptPos:0, #tags:[]], frntImg) 
        
      "Larger Sign":
        -- put "BIG SIGN"
        img = image(80+6,100+6,1)
        rnd = random(14)
        rct = rect(3,3,83,103)
        img.copyPixels(member("largerSigns").image, rct, rect((rnd-1)*80, 0, rnd*80, 100), {#ink:36, #color:color(0,0, 0)})
        
        if l = 1 then
          dp = 0
        else if l = 2 then
          dp = 10
        else
          dp = 20
        end if
        
        mdPnt = giveMiddleOfTile(point(q,c))+point(10, 0)
        
        repeat with r in [[point(-4,-4), color(0,0,255)],[point(-3,-3), color(0,0,255)],[point(3,3), color(255,0,0)],[point(4,4), color(255,0,0)], [point(-2,-2), color(0,255,0)], [point(-1,-1), color(0,255,0)], [point(0,0), color(0,255,0)], [point(1,1), color(0,255,0)], [point(2,2), color(0,255,0)], [point(2,2), color(0,255,0)]] then
          repeat with d = 0 to 1 then
            member("layer" & string(dp + d)).image.copyPixels(img, rect(-43,-53,43,53)+rect(mdPnt,mdPnt)+rect(r[1],r[1]), rect(0,0,86,106), {#ink:36, #color:r[2]})
          end repeat
        end repeat
        
        
        member("layer" & string(dp)).image.copyPixels(img, rect(-43,-53,43,53)+rect(mdPnt,mdPnt), rect(0,0,86,106), {#ink:36, #color:color(255,255,255)})
        member("layer" & string(dp + 1)).image.copyPixels(img, rect(-43,-53,43,53)+rect(mdPnt,mdPnt), rect(0,0,86,106), {#ink:36, #color:color(255,0,255)})
        
        member("largeSignGrad2").image.copyPixels(member("largeSignGrad").image, rect(0,0,80,100), rect(0,0,80,100))
        
        repeat with a = 0 to 6 then
          repeat with b = 0 to 13 then
            rct = rect((a*16)-6, (b*8)-1, ((a+1)*16)-6, ((b+1)*8)-1) --+ rect(0,0,-1,-1)
            if(random(7)=1)then
              blnd = random(random(100))
              member("largeSignGrad2").image.copyPixels(member("pxl").image, rct+rect(0,0,1,1), rect(0,0,1,1), {#color:color(255, 255, 255), #blend:blnd/2})
              member("largeSignGrad2").image.copyPixels(member("pxl").image, rct+rect(1,1,0,0), rect(0,0,1,1), {#color:color(255, 255, 255), #blend:blnd/2})
            else if(random(7)=1)then
              member("largeSignGrad2").image.copyPixels(member("pxl").image, rct+rect(1,1,0,0), rect(0,0,1,1), {#color:color(0, 0, 0), #blend:random(random(60))})
            end if
            member("largeSignGrad2").image.copyPixels(member("pxl").image, rect(rct.left, rct.top, rct.right, rct.top+1), rect(0,0,1,1), {#color:color(255, 255, 255), #blend:20})
            member("largeSignGrad2").image.copyPixels(member("pxl").image, rect(rct.left, rct.top+1, rct.left+1, rct.bottom), rect(0,0,1,1), {#color:color(255, 255, 255), #blend:20})
            
            
          end repeat
        end repeat
        
        copyPixelsToEffectColor("A", dp + 1, rect(mdPnt+point(-43,-53),mdPnt+point(43,53)), "largeSignGrad2", rect(0, 0, 86, 106), 1, 1.0)
        
        
        
        --  
        --  member("gradientA"&string(giveDpFromLr(dp))).image.copyPixels(member("bigSignGradient1").image, rect(mdPnt+point(-30,-30),mdPnt+point(30,30)), rect(0, 0, 60, 60), {#maskImage:member("bigSignGradient").image.createMask()})
        
    end case
  end repeat
  
  
  
  return frntImg  
end


--on drawAShortCut(q, c, l, pltt, frntImg)
--  --  if l = 1 then
--  dp = 0
--  --  else
--  --    dp = 10
--  --  end if
--  
--  rct = rect(strt*20, (strt+tl.sz)*20)+rect(-20*tl.bfTiles, -20*tl.bfTiles, 20*tl.bfTiles, 20*tl.bfTiles)+rect(-20, -20, -20, -20)
--  gtRect = rect(0,0,(tl.sz.locH*20)+(40*tl.bfTiles), (tl.sz.locV*20)+(40*tl.bfTiles))
--  d = 0
--  repeat with ps = 1 to tl.repeatL.count then
--    repeat with ps2 = 1 to tl.repeatL[ps] then
--      -- gtRect =  + rect(0, (((tl.sz.locV*20)+(40*tl.bfTiles))-1)*d, 0, ((tl.sz.locV*20)+(40*tl.bfTiles))*d) 
--      member("layer"&string(d+dp)).image.copyPixels(sav2.image, rct, gtRect + rect(0,gtRect.height*(ps-1), 0, gtRect.height*(ps-1))+rect(0,1,0,1), {#ink:36})
--      d = d + 1  
--    end repeat
--  end repeat
--end


on drawHorizontalSurface(row, dpt)
  -- if row < 10 then
  pnt1 = point(0, row*20)
  pnt2 = point(gLOprops.size.locH*20, row*20)
  repeat with q = 1 to 10 then
    dp = dpt + 10 - q
    -- pt1 = depthPnt(pnt1, dp-5)
    --  pt2 = depthPnt(pnt2, dp-5)
    member("layer"&string(dp)).image.copyPixels(member("horiImg").image, rect(pnt1+point(0,15), pnt2+point(0,20)), rect(pnt1, pnt2)+rect(0,20-q,0,21-q), {#ink:36})
  end repeat
  -- else
  pnt1 = point(0, (row-1)*20)
  pnt2 = point(gLOprops.size.locH*20, (row-1)*20)
  repeat with q = 1 to 10 then
    dp = dpt + 10 - q
    --   pt1 = depthPnt(pnt1, dp-5)
    -- pt2 = depthPnt(pnt2, dp-5)
    member("layer"&string(dp)).image.copyPixels(member("horiImg").image, rect(pnt1+point(0,0), pnt2+point(0,5)), rect(pnt1, pnt2)+rect(0,q,0,q+1), {#ink:36})
  end repeat
  --end if
end

on drawVerticalSurface(col, dpt)
  --if col < 26 then
  pnt1 = point(col*20, 0)
  pnt2 = point(col*20, gLOprops.size.locV*20)
  repeat with q = 1 to 10 then
    dp = dpt + 10 - q
    --   pt1 = depthPnt(pnt1, dp-5)
    --  pt2 = depthPnt(pnt2, dp-5)
    member("layer"&string(dp)).image.copyPixels(member("vertImg").image, rect(pnt1+point(15,0), pnt2+point(20,0)), rect(pnt1, pnt2)+rect(20-q,0,21-q,0), {#ink:36})
  end repeat
  --else
  pnt1 = point((col-1)*20, 0)
  pnt2 = point((col-1)*20, gLOprops.size.locV*20)
  repeat with q = 1 to 10 then
    dp = dpt + 10 - q
    --  pt1 = depthPnt(pnt1, dp-5)
    --  pt2 = depthPnt(pnt2, dp-5)
    member("layer"&string(dp)).image.copyPixels(member("vertImg").image, rect(pnt1+point(0,0), pnt2+point(5,0)), rect(pnt1, pnt2)+rect(q,0,q+1, 0), {#ink:36})
  end repeat
  --end if
end







on giveDptFromCol(col)
  val = 255
  repeat with q = 0 to 19 then
    put val
    val = (val * 0.9).integer
  end repeat
end







on drawPipeTypeTile(mat, tl, layer)
  savSeed = the randomSeed
  global gLOprops
  the randomSeed = seedForTile(tl, gLOprops.tileSeed + layer)
  
  
  gtPos = point(0,0)
  case gLEProps.matrix[tl.locH][tl.locV][layer][1] of
    1:
      
      nbrs = ""
      repeat with dir in [point(-1,0),point(0,-1),point(1,0),point(0,1)]then
        --if afaMvLvlEdit(tl+dir, layer)=1 then
        if (random(2)=1)and(afaMvLvlEdit(tl+dir, layer)=1) then
          nbrs = nbrs & "1"
        else
          nbrs = nbrs & string(isMyTileSetOpenToThisTile(mat, tl+dir, layer))
        end if
        -- else
        --  nbrs = nbrs & "0"
        --end if
      end repeat
      
      --  put nbrs
      case nbrs of
        "0101":
          gtPos = point(2,2)
        "1010":
          gtPos = point(4,2)
        "1111":
          gtPos = point(6,2)
        "0111":
          gtPos = point(8,2)
        "1101":
          gtPos = point(10,2)
        "1110":
          gtPos = point(12,2)
        "1011":
          gtPos = point(14,2)
        "0011":
          gtPos = point(16,2)
        "1001":
          gtPos = point(18,2)
        "1100":
          gtPos = point(20,2)
        "0110":
          gtPos = point(22,2)
        "1000":
          gtPos = point(24,2)
        "0010":
          gtPos = point(26,2)
        "0100":
          gtPos = point(28,2)
        "0001":
          gtPos = point(30,2)
          
      end case
      if mat = "small Pipes" then
        member("layer"&string( ((layer-1)*10)+5 )).image.copyPixels(member("frameWork").image, rect((tl.locH-1-gRenderCameraTilePos.locH)*20, (tl.locV-1-gRenderCameraTilePos.locV)*20, (tl.locH-gRenderCameraTilePos.locH)*20, (tl.locV-gRenderCameraTilePos.locV)*20), rect(0,0,20,20), {#ink:36})
      end if
      
    3:
      gtPos = point(32,2)
    2:
      gtPos = point(34,2)
    4:
      gtPos = point(36,2)
    5:
      gtPos = point(38,2)
  end case
  
  case mat of 
    "small Pipes":
      mem = "pipeTiles"
    "trash":
      mem = "trashTiles2"
  end case
  
  -- d = [2,11,21][layer]
  repeat with startLayer in [((layer-1)*10)+2, ((layer-1)*10)+7] then
    gtPos.locV = [2, 4, 6, 8][random(4)]
    rct = rect((gtPos.locH-1)*20, (gtPos.locV-1)*20, gtPos.locH*20, gtPos.locV*20)
    repeat with d = startLayer to startLayer + 1 then
      
      member("layer"&string(d)).image.copyPixels(member(mem).image, rect((tl.locH-1-gRenderCameraTilePos.locH)*20, (tl.locV-1-gRenderCameraTilePos.locV)*20, (tl.locH-gRenderCameraTilePos.locH)*20, (tl.locV-gRenderCameraTilePos.locV)*20)+rect(-10,-10,10,10), rct+rect(1,1,1,1)+rect(-10,-10,10,10), {#ink:36})
      --member("layer"&string(d)).image.copyPixels(member("pxl").image, rect((tl.locH-1)*20, (tl.locV-1)*20, tl.locH*20, tl.locV*20), rect(0,0,1,1))
    end repeat
  end repeat
  
  case mat of 
    "trash":
      repeat with q = 1 to 3 then
        d = [1,11,21][layer] + random(9)-1
        gt = random(48)
        gt = rect(50*(gt-1), 0, 50*gt, 50)+rect(1,1,1,1)
        rct = giveMiddleOfTile(tl-gRenderCameraTilePos) - point(11,11)+point(random(21), random(21))
        rct = rect(rct-point(25,25), rct+point(25,25))
        member("layer"&string(d)).image.copyPixels(member("assortedTrash").image, rotateToQuad(rct, random(360)), gt, {#ink:36, #color:[color(255,0,0), color(0,255,0), color(0,0,255)][random(3)]})
      end repeat
  end case
  
  
  the randomSeed = savSeed
end






on drawLargeTrashTypeTile(mat, tl, layer, frntImg)
  savSeed = the randomSeed
  global gLOprops
  the randomSeed = seedForTile(tl, gLOprops.tileSeed + layer)
  
  distanceToAir = -1
  repeat with dist = 1 to 5 then
    repeat with dir in [point(-1,0),point(0,-1),point(1,0),point(0,1)]then
      if(afaMvLvlEdit(tl+dir*dist, layer)<>1)then
        distanceToAir = dist
        exit repeat
      end if
    end repeat
    if(distanceToAir <> -1) then
      exit repeat
    end if
  end repeat
  
  
  if(distanceToAir = -1)then
    distanceToAir = 5
  end if
  
  if(distanceToAir < 5)then
    drawPipeTypeTile("trash", tl, layer)
  end if
  
  
  --  pos = 
  
  if(distanceToAir < 3)then
    global gTrashPropOptions, gProps
    
    repeat with q = 1 to distanceToAir + random(2) - 1 then
      dp = restrict(((layer - 1)*10) + random(random(10))-1+random(3), 0, 29)
      
      
      pos = giveMiddleOfTile(tl-gRenderCameraTilePos)
      pos = pos + point(-11+random(21), -11+random(21))
      
      propAddress = gTrashPropOptions[random(gTrashPropOptions.count)]
      prop = gProps[propAddress.locH].prps[propAddress.locV]
      
      rct = rect(pos, pos) + rect(-prop.sz.locH*10,-prop.sz.locV*10,prop.sz.locH*10, prop.sz.locV*10)
      
      gRenderTrashProps.add([-dp, prop.nm, propAddress, rotateToQuad(rct, random(360)), [#settings:[#renderTime:0, #seed:random(1000)]]])
    end repeat
  end if
  
  if(distanceToAir > 2)then
    dp = ((layer - 1)*10)
    pos = giveMiddleOfTile(tl-gRenderCameraTilePos)
    
    if(random(5) <= distanceToAir)then
      member("layer"&string(dp)).image.copyPixels(member("pxl").image, rect(pos.locH-10,pos.locV-10,pos.locH+10,pos.locV+10), rect(0,0,1,1), {#color:color(255,0,0)})
      var = random(14)
      rct = rect(pos, pos) + rect(-30, -30, 30, 30)
      frntImg.copyPixels(member("bigJunk").image, rotateToQuad(rct, random(360)), rect((var-1)*60, 0, var*60, 60)+rect(0,1,0,1), {#ink:36})
    end if
    
    repeat with q = 1 to distanceToAir then
      dp = ((layer - 1)*10) + random(10)-1
      pos = giveMiddleOfTile(tl-gRenderCameraTilePos) + point(-11+random(21), -11+random(21))
      var = random(14)
      rct = rect(pos, pos) + rect(-30, -30, 30, 30)
      member("layer"&string(dp)).image.copyPixels(member("bigJunk").image, rotateToQuad(rct, random(360)), rect((var-1)*60, 0, var*60, 60)+rect(0,1,0,1), {#ink:36})
    end repeat
    
  end if
  
  the randomSeed = savSeed
  
  
end







on drawRidgeTypeTile(mat, tl, layer, frntImg)
  savSeed = the randomSeed
  global gLOprops
  the randomSeed = seedForTile(tl, gLOprops.tileSeed + layer)
  
  distanceToAir = -1
  repeat with dist = 1 to 5 then
    repeat with dir in [point(-1,0),point(0,-1),point(1,0),point(0,1)]then
      if(afaMvLvlEdit(tl+dir*dist, layer)<>1)then
        distanceToAir = dist
        exit repeat
      end if
    end repeat
    if(distanceToAir <> -1) then
      exit repeat
    end if
  end repeat
  
  if(distanceToAir = -1)then
    distanceToAir = 5
  end if  
  
  --  pos = 
  
  if(distanceToAir >= 1)then
    dp = ((layer - 1)*10)
    pos = giveMiddleOfTile(tl-gRenderCameraTilePos)
    
    if(distanceToAir = 1)then
      member("layer"&string(((layer - 1)*10) + 2)).image.copyPixels(member("ridgeBase").image, rect(pos.locH-10,pos.locV-10,pos.locH+10,pos.locV+10), rect(0,0,22,22), {#ink:36})
    end if
    
    if(random(5) <= distanceToAir)then
      -- member("layer"&string(dp)).image.copyPixels(member("pxl").image, rect(pos.locH-10,pos.locV-10,pos.locH+10,pos.locV+10), rect(0,0,1,1), {#color:color(255,0,0)})
      var = random(30)
      rct = rect(pos, pos) + rect(-30, -30, 30, 30)
      frntImg.copyPixels(member("ridgeRocks").image, rotateToQuad(rct, random(15)), rect((var-1)*52, 0, var*52, 52)+rect(0,1,0,1), {#ink:36})
    end if
    
    repeat with q = 1 to distanceToAir then
      if (distanceToAir = 1) then
        dp = ((layer - 1)*10) + random(2)-1
      else
        dp = ((layer - 1)*10) + random(10)-1
      end if
      pos = giveMiddleOfTile(tl-gRenderCameraTilePos) + point(-11+random(21), -11+random(21))
      var = random(30)
      rct = rect(pos, pos) + rect(-30, -30, 30, 30)
      member("layer"&string(dp)).image.copyPixels(member("ridgeRocks").image, rotateToQuad(rct, random(15)), rect((var-1)*52, 0, var*52, 52)+rect(0,1,0,1), {#ink:36})
    end repeat
    
  end if
  
  the randomSeed = savSeed
  
  
end

on drawDirtTypeTile(mat, tl, layer, frntImg)
  savSeed = the randomSeed
  global gLOprops
  the randomSeed = seedForTile(tl, gLOprops.tileSeed + layer)
  
  dp = ((layer - 1)*10)
  pos = giveMiddleOfTile(tl-gRenderCameraTilePos)
  
  optOut = false
  if(layer > 1)then
    optOut = (afaMvLvlEdit(tl, layer-1)=1)
  end if
  
  if(optOut)then
    member("layer"&string(((layer - 1)*10))).image.copyPixels(member("pxl").image, rect(pos,pos)+rect(-14, -14, 14, 14), rect(0,0,1,1), {#ink:36, #color:color(0, 255, 0)})
    var = random(4)
    rct = rect(pos, pos) + rect(-18, -18, 18, 18)
    member("layer"&string(dp)).image.copyPixels(member("rubbleGraf" & var).image, rotateToQuad(rct, random(360)), member("rubbleGraf" & var).image.rect, {#ink:36, #color:color(0, 255, 0)})
  else
    
    distanceToAir = 6
    ext = 0
    repeat with dist = 1 to 5 then
      repeat with dir in [point(-1,0),point(-1,-1),point(0,-1),point(1,-1),point(1,0),point(1,1),point(0,1),point(-1,1)]then
        if(afaMvLvlEdit(tl+dir*dist, layer)<>1)then
          distanceToAir = dist
          ext = 1
          exit repeat
        end if
      end repeat
      if(ext) then
        exit repeat
      end if
    end repeat
    
    distanceToAir = distanceToAir + -2 + random(3)
    
    
    
    if(distanceToAir >= 5)then
      member("layer"&string(((layer - 1)*10))).image.copyPixels(member("pxl").image, rect(pos,pos)+rect(-14, -14, 14, 14), rect(0,0,1,1), {#ink:36, #color:color(0, 255, 0)})
      var = random(4)
      rct = rect(pos, pos) + rect(-18, -18, 18, 18)
      member("layer"&string(dp)).image.copyPixels(member("rubbleGraf" & var).image, rotateToQuad(rct, random(360)), member("rubbleGraf" & var).image.rect, {#ink:36, #color:color(0, 255, 0)})
    else
      amnt = lerp(distanceToAir, 3, 0.5)*15
      if(layer > 1)then
        amnt = distanceToAir*10
      end if
      repeat with q = 1 to amnt then
        dp = ((layer - 1)*10) + random(10)-1
        pos = giveMiddleOfTile(tl-gRenderCameraTilePos) + point(-11+random(21), -11+random(21))
        var = random(4)
        drawDirtClot(pos, dp, var, layer, distanceToAir)
      end repeat
      if(layer < 3) then
        repeat with dist = 1 to 3 then
          repeat with dir in [point(-1,0),point(-1,-1),point(0,-1),point(1,-1),point(1,0),point(1,1),point(0,1),point(-1,1)]then
            if(afaMvLvlEdit(tl+dir*dist, layer+1)=1)and(afaMvLvlEdit(tl+dir*dist, layer)<>1)then
              repeat with q = 1 to 10 then
                if(layer = 1)then
                  dpAdd = 6+random(4)
                else
                  dpAdd = 2+random(8)
                end if
                pos = giveMiddleOfTile(tl-gRenderCameraTilePos) + point(-11+random(21), -11+random(21)) + dir * dist * dist * dpAdd * random(85) * 0.01
                var = random(4)
                drawDirtClot(pos, ((layer - 1)*10) + dpAdd, var, layer, distanceToAir)
              end repeat
            end if
          end repeat
        end repeat
      end if
    end if
    
  end if
  
  the randomSeed = savSeed
end


on drawDirtClot(pos, dp, var, layer, distanceToAir)
  szAdd = (random(distanceToAir+1)-1)
  
  repeat with d = 0 to 2 then
    sz = 5 + szAdd + d*2
    pstDp = restrict(dp-1+d, 0, 29)
    rct = rect(pos, pos) + rect(-sz, -sz, sz, sz)
    member("layer"&string(pstDp)).image.copyPixels(member("rubbleGraf" & var).image, rotateToQuad(rct, random(360)), member("rubbleGraf" & var).image.rect, {#ink:36, #color:color(0, 255, 0)})
  end repeat
  
  
  
  -- pos2 = giveGridPos(pos + point(-10, -10))
  if((random(6)>distanceToAir)and(random(3)=1))or((afaMvLvlEdit(giveGridPos(pos + point(-10, -10))+gRenderCameraTilePos, layer)<>1)and((afaMvLvlEdit(giveGridPos(pos + point(10, 10))+gRenderCameraTilePos, layer)=1)) or (layer = 2))then
    repeat with d = 0 to 2 then
      sz = 2 + (szAdd*0.5) + d*2
      pstDp = restrict(dp-1+d, 0, 29)
      rct = rect(pos, pos) + rect(-sz, -sz, sz, sz) + rect(point(-4,-4)+point(-2*d, -2*d), point(-4,-4)+point(-2*d, -2*d))
      member("layer"&string(pstDp)).image.copyPixels(member("rubbleGraf" & var).image, rotateToQuad(rct, random(360)), member("rubbleGraf" & var).image.rect, {#ink:36, #color:color(0, 0, 255)})
    end repeat
  end if
  
  if((random(6)>distanceToAir)and(random(3)=1))or((afaMvLvlEdit(giveGridPos(pos + point(10, 10))+gRenderCameraTilePos, layer)<>1)and((afaMvLvlEdit(giveGridPos(pos + point(-10, -10))+gRenderCameraTilePos, layer)=1)) or (layer = 2))then
    repeat with d = 0 to 2 then
      sz = 2 + (szAdd*0.5) + d*2
      pstDp = restrict(dp-1+d, 0, 29)
      rct = rect(pos, pos) + rect(-sz, -sz, sz, sz) + rect(point(4,4)+point(2*d, 2*d), point(4,4)+point(2*d, 2*d))
      member("layer"&string(pstDp)).image.copyPixels(member("rubbleGraf" & var).image, rotateToQuad(rct, random(360)), member("rubbleGraf" & var).image.rect, {#ink:36, #color:color(255, 0, 0)})
    end repeat
  end if
end




on drawCeramicTypeTile(mat, tl, layer, frntImg)
  savSeed = the randomSeed
  global gLOprops, gEEprops, gAnyDecals
  
  the randomSeed = seedForTile(tl, gLOprops.tileSeed + layer)
  
  chaos = 0
  doColor = 0
  
  repeat with q = 1 to gEEprops.effects.count then
    if(gEEprops.effects[q].nm = "Ceramic Chaos")then
      if(gEEprops.effects[q].mtrx[tl.loch][tl.locv] > chaos)then
        chaos = gEEprops.effects[q].mtrx[tl.loch][tl.locv]
      end if
      if(gEEprops.effects[q].Options[2][3] = "White")then
        doColor = true
      end if
    end if
  end repeat
  
  if(doColor)then
    gAnyDecals = true
  end if
  
  chaos = chaos * 0.01
  
  dp = ((layer - 1)*10)
  pos = giveMiddleOfTile(tl-gRenderCameraTilePos)
  clr = color(239, 234, 224)
  
  
  lft = 0
  rght = 0
  tp = 0
  bttm = 0
  if(afaMvLvlEdit(tl+point(-1,0), layer)<>1)then
    lft = 1
  end if
  if(afaMvLvlEdit(tl+point(1,0), layer)<>1)then
    rght = 1
  end if
  if(afaMvLvlEdit(tl+point(0,-1), layer)<>1)then
    tp = 1
  end if
  if(afaMvLvlEdit(tl+point(0,1), layer)<>1)then
    bttm = 1
  end if
  
  repeat with q = 1 to 9 then
    member("layer"&string(((layer - 1)*10)+q)).image.copyPixels(member("pxl").image, rect(pos,pos)+rect(-10+lft, -10+tp, 10-rght, 10-bttm), rect(0,0,1,1), {#ink:36, #color:color(255*(1-doColor), 255*doColor, 0)})
  end repeat
  member("layer"&string(((layer - 1)*10)+1)).image.copyPixels(member("ceramicTileSocket").image, rect(pos,pos)+rect(-8, -8, 8, 8), member("ceramicTileSocket").image.rect, {#ink:36, #color:color(255*doColor, 255*(1-doColor), 0)})
  
  
  if(lft)and(random(120)>chaos*chaos*chaos*100)then
    repeat with q = 2 to 8 then
      member("layer"&string(((layer - 1)*10)+q)).image.copyPixels(member("pxl").image, rect(pos,pos)+rect(-11, -9, -9, 9), rect(0,0,1,1), {#ink:36, #color:color(0, 255, 0)})
      member("layer"&string(((layer - 1)*10)+q)).image.copyPixels(member("pxl").image, rect(pos,pos)+rect(-11, -9, -9, -8), rect(0,0,1,1), {#ink:36, #color:color(0, 0, 255)})
      if(doColor)then
        member("layer"&string(((layer - 1)*10)+q)&"dc").image.copyPixels(member("pxl").image, rect(pos,pos)+rect(-11, -9, -9, 9), rect(0,0,1,1), {#ink:36, #color:clr})
      end if
    end repeat
  end if
  
  if(rght)and(random(120)>chaos*chaos*chaos*100)then
    repeat with q = 2 to 8 then
      member("layer"&string(((layer - 1)*10)+q)).image.copyPixels(member("pxl").image, rect(pos,pos)+rect(9, -9, 11, 9), rect(0,0,1,1), {#ink:36, #color:color(0, 255, 0)})
      member("layer"&string(((layer - 1)*10)+q)).image.copyPixels(member("pxl").image, rect(pos,pos)+rect(9, -9, 11, -8), rect(0,0,1,1), {#ink:36, #color:color(0, 0, 255)})
      if(doColor)then
        member("layer"&string(((layer - 1)*10)+q)&"dc").image.copyPixels(member("pxl").image, rect(pos,pos)+rect(9, -9, 11, 9), rect(0,0,1,1), {#ink:36, #color:clr})
      end if
    end repeat
  end if
  
  if(tp)and(random(120)>chaos*chaos*chaos*100)then
    repeat with q = 2 to 8 then
      member("layer"&string(((layer - 1)*10)+q)).image.copyPixels(member("pxl").image, rect(pos,pos)+rect(-9, -11, 9, -9), rect(0,0,1,1), {#ink:36, #color:color(0, 255, 0)})
      member("layer"&string(((layer - 1)*10)+q)).image.copyPixels(member("pxl").image, rect(pos,pos)+rect(-9, -11, -8, -9), rect(0,0,1,1), {#ink:36, #color:color(0, 0, 255)})
      if(doColor)then
        member("layer"&string(((layer - 1)*10)+q)&"dc").image.copyPixels(member("pxl").image, rect(pos,pos)+rect(-9, -11, 9, -9), rect(0,0,1,1), {#ink:36, #color:clr})
      end if
    end repeat
  end if
  
  if(bttm)and(random(120)>chaos*chaos*chaos*100)then
    repeat with q = 2 to 8 then
      member("layer"&string(((layer - 1)*10)+q)).image.copyPixels(member("pxl").image, rect(pos,pos)+rect(-9, 9, 9, 11), rect(0,0,1,1), {#ink:36, #color:color(0, 255, 0)})
      member("layer"&string(((layer - 1)*10)+q)).image.copyPixels(member("pxl").image, rect(pos,pos)+rect(-9, 9, -8, 11), rect(0,0,1,1), {#ink:36, #color:color(0, 0, 255)})
      if(doColor)then
        member("layer"&string(((layer - 1)*10)+q)&"dc").image.copyPixels(member("pxl").image, rect(pos,pos)+rect(-9, 9, 9, 11), rect(0,0,1,1), {#ink:36, #color:clr})
      end if
    end repeat
  end if
  
  
  
  pos = pos + point(-7+random(13), -7+random(13))*chaos*chaos*chaos*random(100)*0.01
  
  if(chaos = 0)or(random(300 - 298*chaos*chaos*chaos)>1)then
    if(random(100)<chaos*100)then
      f = (random(1000 + 4000*chaos)*chaos).integer
      repeat with a = 1 to (1.0-chaos)*4 then
        f = random(f)
        if(f = 1)then
          exit repeat
        end if
      end repeat
    else
      f = 1
    end if
    if(abs(f) > 1)then
      f = f - 1
      if(random(2)=1)then
        f = f * -1
      end if
      member("layer"&string(((layer - 1)*10))).image.copyPixels(member("ceramicTile").image, rotateToQuad(rect(pos,pos)+rect(-9, -9, 9, 9), -90.05122 + f*0.01), member("ceramicTile").image.rect, {#ink:36})
      if(doColor)then
        member("layer"&string(((layer - 1)*10))&"dc").image.copyPixels(member("ceramicTileSilh").image, rotateToQuad(rect(pos,pos)+rect(-9, -9, 9, 9), -90.05122 + f*0.01), member("ceramicTileSilh").image.rect, {#ink:36, #color:clr})
      end if
    else
      member("layer"&string(((layer - 1)*10))).image.copyPixels(member("ceramicTile").image, rect(pos,pos)+rect(-9, -9, 9, 9), member("ceramicTile").image.rect, {#ink:36})
      if(doColor)then
        member("layer"&string(((layer - 1)*10))&"dc").image.copyPixels(member("ceramicTileSilh").image, rect(pos,pos)+rect(-9, -9, 9, 9), member("ceramicTileSilh").image.rect, {#ink:36, #color:clr})
      end if
    end if
  end if
  
  
  
  the randomSeed = savSeed
end


on drawDPTTile(mat, tl, layer, frntImg)
  savSeed = the randomSeed
  global gLOprops
  the randomSeed = seedForTile(tl, gLOprops.tileSeed + layer)
  
  pos = giveMiddleOfTile(tl-gRenderCameraTilePos)
  pstLr = DPStartLayerOfTile(tl, layer)
  
  if(afaMvLvlEdit(tl, layer) > 1)then
    a = afaMvLvlEdit(tl, layer)
    var = 16 
    case a of
      2: var = 20
      3: var = 19
      4: var = 17
      5: var = 18
    end case
    
    repeat with q = pstLr to (layer * 10)-1 then
      member("layer" & q).image.copyPixels(member(mat & "image").image, rect(pos-point(20,20), pos+point(20,20)), rect((var-1)*40,1,var*40,41), {#ink:36})
    end repeat
  else
    
    
    
    lst = ["0000", "1111", "0101", "1010", "0001", "1000", "0100", "0010", "1001", "1100", "0110", "0011", "1011", "1101", "1110", "0111"]
    
    lftDp = DPStartLayerOfTile(tl+point(-1,0), layer)
    rghtDp = DPStartLayerOfTile(tl+point(1,0), layer)
    tpDp = DPStartLayerOfTile(tl+point(0,-1), layer)
    bttmDp = DPStartLayerOfTile(tl+point(0,1), layer)
    
    repeat with q = pstLr to (layer * 10)-1 then
      
      lft =  solidAfaMv(tl+point(-1,0), layer) * DPCircuitConnection(tl+point(-1,0), q).locH * (lftDp<=q)
      rght = solidAfaMv(tl+point(1,0), layer) * DPCircuitConnection(tl, q).locH * (rghtDp<=q) 
      tp =  solidAfaMv(tl+point(0,-1), layer) * DPCircuitConnection(tl+point(0,-1), q).locV* (tpDp<=q) 
      bttm = solidAfaMv(tl+point(0,1), layer) * DPCircuitConnection(tl, q).locV * (bttmDp<=q) 
      
      if(afaMvLvlEdit(tl+point(-1,0), layer)>1)then
        lft = 1
      end if
      if(afaMvLvlEdit(tl+point(1,0), layer)>1)then
        rght = 1
      end if
      if(afaMvLvlEdit(tl+point(0,-1), layer)>1)then
        tp = 1
      end if
      if(afaMvLvlEdit(tl+point(0,1), layer)>1)then
        bttm = 1
      end if
      
      
      var = lst.getPos((string(lft) & string(tp) & string(rght) & string(bttm)))
      rand = 1
      if(mat = "circuits")then
        rand = random(5)
      end if
      
      member("layer" & q).image.copyPixels(member(mat & "image").image, rect(pos-point(20,20), pos+point(20,20)), rect((var-1)*40,1+(rand-1)*40,var*40,1+rand*40), {#ink:36})
    end repeat
  end if
  
  the randomSeed = savSeed
end



on DPCircuitConnection(tl, dpAdd)
  savSeed = the randomSeed
  the randomSeed = seedForTile(tl)+(dpAdd/2).integer*(tl.locH/3).integer-(tl.locV/2).integer
  
  if(random(2)=1)then
    pnt = point(random(2)-1, random(2)-1)
  else
    if(random(2)=1)then
      pnt = point(1, 0)
    else
      pnt = point(0, 1)
    end if
  end if
  
  
  the randomSeed = savSeed
  
  return pnt
end

on DPStartLayerOfTile(tl, layer)
  if(layer > 1)then
    if(afaMvLvlEdit(tl, layer-1)=1)then
      --  return 0
    end if
  end if
  
  distanceToAir = DistanceToAir(tl, layer)
  
  --  if(random(300)=1)then
  --  put distanceToAir
  -- end if
  
  if(distanceToAir >= 7)and(layer=1)then
    --   return 0
  end if
  
  pushIn = 6-distanceToAir
  pushIn = pushIn - (layer=1) - 3*(layer=3)
  pushIn = restrict(pushIn, -4*(layer>1)-5*(layer=3), 9-5*(layer=1))
  
  
  return (layer-1)*10 + pushIn
end

on DistanceToAir(tl, layer)
  distanceToAir = 8
  ext = 0
  repeat with dist = 1 to 7 then
    repeat with dir in [point(-1,0),point(-1,-1),point(0,-1),point(1,-1),point(1,0),point(1,1),point(0,1),point(-1,1)]then
      if(afaMvLvlEdit(tl+dir*dist, layer)<>1)and(afaMvLvlEdit(tl+dir*dist, restrict(layer-1, 1, 3))<>1)then
        distanceToAir = dist
        ext = 1
        exit repeat
      end if
    end repeat
    if(ext) then
      exit repeat
    end if
  end repeat
  return distanceToAir
end 


on drawTinySigns
  member("Tiny SignsTexture").image.copyPixels(member("pxl").image, rect(0, 0, 1080, 800), rect(0,0,1,1), {#color:color(0,255,0)})
  
  language = 2
  
  blueList = [point(1,1), point(1,0), point(0,1)]
  redList = [point(-1,-1), point(-1,0), point(0,-1)]
  
  tlSize = 8
  repeat with c = 0 to 100 then
    repeat with q = 0 to 135 then
      --putRct = rect((q-1)*8, )
      mdPnt = point((q+0.5)*tlSize, (c+0.5)*tlSize)
      
      gtPos = point(random([20,14,1][language]), language)
      
      
      
      if random(50)=1 then
        language = 2
      else if random(80)=1 then
        language = 1
      end if
      
      if random(7)=1 then
        if random(3)=1 then
          gtPos = point(1, 3)
        else
          gtPos = point(random(random(7)), 3)
          if random(5)=1 then
            language = 2
          else if random(10)=1 then
            language = 1
          end if
        end if
      end if
      
      repeat with p in redList then
        member("Tiny SignsTexture").image.copyPixels(member("tinySigns").image, rect(mdPnt, mdPnt)+rect(-3,-3,3,3)+rect(p,p), rect((gtPos.locH-1)*6,(gtPos.locV-1)*6,gtPos.locH*6,gtPos.locV*6), {#ink:36, #color:color(255,0,0)})
      end repeat
      repeat with p in blueList then
        member("Tiny SignsTexture").image.copyPixels(member("tinySigns").image, rect(mdPnt, mdPnt)+rect(-3,-3,3,3)+rect(p,p), rect((gtPos.locH-1)*6,(gtPos.locV-1)*6,gtPos.locH*6,gtPos.locV*6), {#ink:36, #color:color(0,0,255)})
      end repeat
      
      member("Tiny SignsTexture").image.copyPixels(member("tinySigns").image, rect(mdPnt, mdPnt)+rect(-3,-3,3,3), rect((gtPos.locH-1)*6,(gtPos.locV-1)*6,gtPos.locH*6,gtPos.locV*6), {#ink:36, #color:color(0,255,0)})
    end repeat
  end repeat
end





on renderTileMaterial(layer, material, frntImg)
  --  if(tilesToRender.count = 0)then
  --    return frntImg
  --  end if
  
  
  tlsOrdered = []
  
  
  repeat with q = 1 to gLOprops.size.loch then
    repeat with c = 1 to gLOprops.size.locv then
      if (gLEProps.matrix[q][c][layer][1] <> 0) then
        addMe = 0
        if(gTEprops.tlMatrix[q][c][layer].tp = "material")then
          if(gTEprops.tlMatrix[q][c][layer].data = material)then
            addMe = 1
          end if
        else if (gTEprops.defaultMaterial = material)then
          if (gTEprops.tlMatrix[q][c][layer].tp = "default")then
            addMe = 1
          end if
        end if
        
        if(addMe)then
          if (gLEProps.matrix[q][c][layer][1] = 1) then
            tlsOrdered.add([random(gLOprops.size.loch+gLOprops.size.locV), point(q,c)])
          else if (material = "Temple Stone")then
            tlsOrdered.add([random(gLOprops.size.loch+gLOprops.size.locV), point(q,c)])
          else if (point(q,c).inside(rect(gRenderCameraTilePos, gRenderCameraTilePos+point(100, 60)))) then
            frntImg = drawATileMaterial(q, c, layer, "Standard", frntImg)
          end if
        end if
      end if
    end repeat
  end repeat
  
  tlsOrdered.sort()
  tls = []
  repeat with q = 1 to tlsOrdered.count then
    tls.add(tlsOrdered[q][2])
  end repeat
  
  
  --repeat with q = 1 to tilesToRender.count then
  --   if gLEProps.matrix[tilesToRender[q][2]][tilesToRender[q][3]][layer][1] = 1 then
  --        tls.add(point(tilesToRender[q][2], tilesToRender[q][3]))
  --      else
  --        frntImg = drawATileMaterial(tilesToRender[q][2], tilesToRender[q][3], layer, "Standard", frntImg)
  --      end if
  --end repeat
  
  
  
  
  case material of
    "Chaotic Stone":
      
      delL = []
      repeat with tl in tls then
        if delL.getPos(tl)=0 then
          hts = 0
          repeat with dir in [point(1,0), point(0,1), point(1,1)] then
            hts = hts + (tls.getPos(tl+dir)>0)*(delL.getPos(tl+dir)=0)
          end repeat
          if hts = 3 then
            if(tl.inside(rect(gRenderCameraTilePos, gRenderCameraTilePos+point(100, 60)))) then
              frntImg = drawATileTile(tl.loch,tl.locV,layer, gTiles[3].tls[2], frntImg)
            end if
            repeat with dir in [point(1,0), point(0,1), point(1,1)] then
              delL.add(tl+dir)
            end repeat
            delL.add(tl)
          end if
        end if
      end repeat
      
      repeat with c in delL then
        tls.deleteOne(c)
      end repeat
      
      savSeed = the randomSeed 
      repeat while tls.count > 0 then
        the randomSeed  = gLOprops.tileSeed + tls.count
        tl = tls[random(tls.count)]
        if(tl.inside(rect(gRenderCameraTilePos, gRenderCameraTilePos+point(100, 60)))) then
          frntImg = drawATileTile(tl.locH,tl.locV,layer, gTiles[3].tls[1], frntImg)
        end if
        tls.deleteOne(tl)
      end repeat
      the randomSeed  = savSeed
      
    "Tiled Stone":
      
      delL = []
      repeat with tl in tls then
        if delL.getPos(tl)=0 then
          if (tl.locV mod 2)and((tl.locH+((tl.locV mod 4)=1)) mod 2) then
            hts = 0
            repeat with dir in [point(1,0), point(0,1), point(1,1)] then
              hts = hts + (tls.getPos(tl+dir)>0)*(delL.getPos(tl+dir)=0)
            end repeat
            if hts = 3 then
              frntImg = drawATileTile(tl.loch,tl.locV,layer, gTiles[3].tls[2], frntImg)
              repeat with dir in [point(1,0), point(0,1), point(1,1)] then
                delL.add(tl+dir)
              end repeat
              delL.add(tl)
            end if
          end if
        end if
      end repeat
      
      repeat with c in delL then
        tls.deleteOne(c)
      end repeat
      
      repeat while tls.count > 0 then
        tl = tls[random(tls.count)]
        frntImg = drawATileTile(tl.locH,tl.locV,layer, gTiles[3].tls[1], frntImg)
        tls.deleteOne(tl)
      end repeat
      
    "3DBricks":
      repeat while tls.count > 0 then
        tl = tls[random(tls.count)]
        frntImg = drawATileTile(tl.locH,tl.locV,layer, gTiles[3].tls[8], frntImg)
        tls.deleteOne(tl)
      end repeat
      
    "Random Machines":
      savSeed = the randomSeed
      
      the randomSeed = gLOprops.tileSeed + layer
      
      randomMachines = []
      repeat with w = 1 to 8 then
        lst = []
        repeat with h = 1 to 8 then
          lst.add([])
        end repeat
        randomMachines.add(lst)
      end repeat
      
      grabTiles = ["Machinery", "Machinery2", "Small machine"]
      forbidden = ["Feather Box - W", "Feather Box - E", "Piston Arm", "Vertical Conveyor Belt A"]
      repeat with a = 1 to grabTiles.count then
        repeat with q = 1 to gTiles.count then
          if(gTiles[q].nm = grabTiles[a])then
            repeat with t = 1 to gTiles[q].tls.count then
              if(gTiles[q].tls[t].sz.locH <= 8)and(gTiles[q].tls[t].sz.locV <= 8)and(gTiles[q].tls[t].specs2 = 0)and(forbidden.getPos(gTiles[q].tls[t].nm) = 0)then
                randomMachines[gTiles[q].tls[t].sz.locH][gTiles[q].tls[t].sz.locV].add(point(q,t))
              end if
            end repeat
          end if
        end repeat
      end repeat
      
      delL = []
      repeat with tl in tls then
        the randomSeed = seedForTile(tl, gLOprops.tileSeed + layer)
        if delL.getPos(tl)=0 then
          
          randomOrderList = []
          repeat with w = 1 to randomMachines.count then
            repeat with h = 1 to randomMachines[w].count then
              repeat with t = 1 to randomMachines[w][h].count then
                randomOrderList.add([random(1000), randomMachines[w][h][t]])
              end repeat
            end repeat
          end repeat
          
          randomOrderList.sort()
          
          repeat with q = 1 to randomOrderList.count then 
            testTile = gTiles[randomOrderList[q][2].locH].tls[randomOrderList[q][2].locV]
            
            legalToPlace = true
            repeat with a = 0 to testTile.sz.locH-1 then
              repeat with b = 0 to testTile.sz.locV-1 then
                testPoint = tl + point(a,b)
                spec = testTile.specs[(b+1) + (a*testTile.sz.locV)]
                
                if(tls.getPos(testPoint)=0)then
                  legalToPlace = false
                  exit repeat
                end if
                
                if(spec > -1)then
                  if(delL.getPos(testPoint)>0)then
                    legalToPlace = false
                    exit repeat
                  end if
                  if(afaMvLvlEdit(testPoint, layer) <> spec)then
                    legalToPlace = false
                    exit repeat
                  end if
                end if
              end repeat
              if(legalToPlace = false)then
                exit repeat
              end if
            end repeat
            
            if(legalToPlace)then
              rootPos = tl + point(((testTile.sz.locH.float/2.0) + 0.4999).integer-1, ((testTile.sz.locV.float/2.0) + 0.4999).integer-1)
              if(rootPos.inside(rect(gRenderCameraTilePos, gRenderCameraTilePos+point(100, 60))))then
                frntImg = drawATileTile(rootPos.loch,rootPos.locV,layer,testTile, frntImg)
              end if
              repeat with a = 0 to testTile.sz.locH-1 then
                repeat with b = 0 to testTile.sz.locV-1 then
                  spec = testTile.specs[(b+1) + (a*testTile.sz.locV)]
                  if(spec > -1)then
                    delL.add(tl+point(a,b))
                  end if
                end repeat
              end repeat
              exit repeat
            end if
          end repeat
        end if
        
      end repeat
      
      
      the randomSeed = savSeed
      
      
    "Temple Stone":
      tileCat = 0
      repeat with q = 1 to gTiles.count then
        if(gTiles[q].nm = "Temple Stone")then
          tileCat = q
          exit repeat
        end if
      end repeat
      
      global templeStoneCorners
      templeStoneCorners = [[], [], [], []]
      
      tls2 = tls.duplicate()
      
      cnt =  tls.count
      repeat with q = 1 to cnt then
        tl = tls[cnt + 1 - q]
        if(afaMvLvlEdit(point(tl.locH, tl.locV), layer) = 2)then
          frntImg = drawATileTile(tl.locH,tl.locV,layer, gTiles[tileCat].tls[6], frntImg)
          tls.deleteAt(cnt + 1 - q)
        else if(afaMvLvlEdit(point(tl.locH, tl.locV), layer) = 3)then
          frntImg = drawATileTile(tl.locH,tl.locV,layer, gTiles[tileCat].tls[5], frntImg)
          tls.deleteAt(cnt + 1 - q)
        else if(afaMvLvlEdit(point(tl.locH, tl.locV), layer) = 4)then
          frntImg = drawATileTile(tl.locH,tl.locV,layer, gTiles[tileCat].tls[7], frntImg)
          tls.deleteAt(cnt + 1 - q)
        else  if(afaMvLvlEdit(point(tl.locH, tl.locV), layer) = 5)then
          frntImg = drawATileTile(tl.locH,tl.locV,layer, gTiles[tileCat].tls[8], frntImg)
          tls.deleteAt(cnt + 1 - q)
        end if
      end repeat
      
      repeat with q = 1 to tls2.count then
        tl = tls2[q]
        if((tl.locV mod 4) = 0)then
          if((tl.locH mod 6) = 0)then
            attemptDrawTempleStone(tl, tls, 2, layer, frntImg, tileCat)
            --else if((tl.locH mod 6) = 3)then
            --  attemptDrawTempleStone(tl, tls, 3, layer, frntImg, tileCat)
          end if
        end if
        if((tl.locV mod 4) = 2)then
          if((tl.locH mod 6) = 3)then
            attemptDrawTempleStone(tl, tls, 2, layer, frntImg, tileCat)
            --  else if((tl.locH mod 6) = 0)then
            --   attemptDrawTempleStone(tl, tls, 3, layer, frntImg, tileCat)
          end if
        end if
      end repeat
      
      repeat with q = 1 to templeStoneCorners[1].count then
        ind = templeStoneCorners[1].count + 1 - q
        if(templeStoneCorners[3].getPos(templeStoneCorners[1][ind]) > 0)then
          --  templeStoneCorners[3].deleteOne(templeStoneCorners[1][ind])
          tls.deleteOne(templeStoneCorners[1][ind])
          --  templeStoneCorners[1].deleteAt(ind)
        end if
      end repeat
      
      repeat with q = 1 to templeStoneCorners[2].count then
        ind = templeStoneCorners[2].count + 1 - q
        if(templeStoneCorners[4].getPos(templeStoneCorners[2][ind]) > 0)then
          --  templeStoneCorners[4].deleteOne(templeStoneCorners[2][ind])
          tls.deleteOne(templeStoneCorners[2][ind])
          --  templeStoneCorners[2].deleteAt(ind)
        end if
      end repeat
      
      
      
      
      repeat while tls.count > 0 then
        tl = tls[random(tls.count)]
        drawn = false
        if(templeStoneCorners[1].getPos(tl) > 0)then
          frntImg = drawATileTile(tl.locH,tl.locV,layer, gTiles[tileCat].tls[7], frntImg)
          drawn = true
        else if(templeStoneCorners[2].getPos(tl) > 0)then
          frntImg = drawATileTile(tl.locH,tl.locV,layer, gTiles[tileCat].tls[8], frntImg)
          drawn = true
        else if(templeStoneCorners[3].getPos(tl) > 0)then
          frntImg = drawATileTile(tl.locH,tl.locV,layer, gTiles[tileCat].tls[5], frntImg)
          drawn = true
        else if(templeStoneCorners[4].getPos(tl) > 0)then
          frntImg = drawATileTile(tl.locH,tl.locV,layer, gTiles[tileCat].tls[6], frntImg)
          drawn = true
        end if
        
        if(drawn = false)then
          occupy = [point(-1,0), point(-1,1), point(0,0), point(0,1), point(1,0), point(1,1)]
          drawn = true
          repeat with q = 1 to occupy.count then
            if(checkIfATileIsSolidAndSameMaterial(tl + occupy[q], layer, "Temple Stone") = false) then
              drawn = false
              exit repeat
            end if
            repeat with a = 1 to 4 then
              if(templeStoneCorners[a].getPos(tl + occupy[q]) > 0) then
                drawn = false
                exit repeat
              end if
            end repeat
            if(drawn = false)then
              exit repeat
            end if
            if(tls.getPos(tl + occupy[q]) = 0)then
              drawn = false
              exit repeat
            end if
          end repeat
          if(drawn)then
            frntImg = drawATileTile(tl.locH,tl.locV,layer, gTiles[tileCat].tls[9], frntImg)
            repeat with q = 1 to occupy.count then
              tls.deleteOne(tl + occupy[q])
            end repeat
          end if
        end if
        
        if( drawn = false)then
          if(checkIfATileIsSolidAndSameMaterial(tl + point(-1,0), layer, "Temple Stone") and tls.getPos(tl + point(-1,0)) > 0) and(templeStoneCorners[1].getPos(tl+point(-1,0)) = 0)and(templeStoneCorners[2].getPos(tl+point(-1,0)) = 0)and(templeStoneCorners[3].getPos(tl+point(-1,0)) = 0)and(templeStoneCorners[4].getPos(tl+point(-1,0)) = 0)then
            frntImg = drawATileTile(tl.locH-1,tl.locV,layer, gTiles[tileCat].tls[3], frntImg)
            tls.deleteOne(tl + point(-1,0))
          else if(checkIfATileIsSolidAndSameMaterial(tl + point(1,0), layer, "Temple Stone") and tls.getPos(tl + point(1,0)) > 0)and(templeStoneCorners[1].getPos(tl+point(1,0)) = 0)and(templeStoneCorners[2].getPos(tl+point(1,0)) = 0)and(templeStoneCorners[3].getPos(tl+point(1,0)) = 0)and(templeStoneCorners[4].getPos(tl+point(1,0)) = 0)then
            frntImg = drawATileTile(tl.locH,tl.locV,layer, gTiles[tileCat].tls[3], frntImg)
            tls.deleteOne(tl + point(1,0))
          else
            frntImg = drawATileTile(tl.locH,tl.locV,layer, gTiles[tileCat].tls[4], frntImg)
          end if
        end if
        
        tls.deleteOne(tl)
      end repeat
      
      templeStoneCorners = []
  end case
  
  return frntImg
end

on attemptDrawTempleStone(tlPos, tilesList, templeStoneType, layer, frntImg, tileCat)
  global templeStoneCorners
  occupy = []
  
  case templeStoneType of
    2:
      occupy = [point(-1,0), point(0, -1), point(0,0), point(0,1), point(1,-1), point(1,0), point(1,1), point(2,0)]
    3:
      occupy = [point(0,0), point(1,0)]
  end case
  
  
  repeat with q = 1 to occupy.count then
    if(checkIfATileIsSolidAndSameMaterial(tlPos + occupy[q], layer, "Temple Stone") = 0)then
      return tilesList
    end if
  end repeat
  
  frntImg = drawATileTile(tlPos.locH,tlPos.locV,layer, gTiles[tileCat].tls[templeStoneType], frntImg)
  
  if(templeStoneType = 2)then
    templeStoneCorners[1].add(tlPos + point(-1, -1))
    templeStoneCorners[2].add(tlPos + point(2, -1))
    templeStoneCorners[3].add(tlPos + point(2, 1))
    templeStoneCorners[4].add(tlPos + point(-1, 1))
  end if
  
  repeat with q = 1 to occupy.count then
    tilesList.deleteOne(tlPos + occupy[q])
  end repeat
  return tilesList
end 

--on IsTileADoubleInChaoticStone(tl, lr)
--  if(tl.loch < 0)or(tl.locv < 0) then 
--    return false
--  end if
--  
--  if (checkIfATileIsSolidAndSameMaterial(tl, lr, "Chaotic Stone")) then
--    
--    savseed = the randomSeed
--    the randomSeed = SeedOfTile(tl)
--    rtrn = false
--    
--    if (random(3)>1) then
--      rtrn = true
--      repeat with dir in [point(1,0), point(0,1), point(1,1)] then
--     --   if(IsTileADoubleInChaoticStone(tl-dir, lr)) then return false
--        if (checkIfATileIsSolidAndSameMaterial(tl+dir, lr, "Chaotic Stone") = 0) then
--          rtrn = false
--          exit repeat
--        end if
--      end repeat
--    end if
--    
--    the randomSeed = savseed
--    return rtrn
--    
--    
--  else
--    return false  
--  end if
--end


on checkIfTileHasMaterialRenderTypeTiles(tl, lr)
  retrn = 0
  
  if (checkIfATileIsSolidAndSameMaterial(tl, lr, "Chaotic Stone"))or(checkIfATileIsSolidAndSameMaterial(tl, lr, "Tiled Stone"))then
    retrn = 1
  end if
  
  return retrn
end








on renderHarvesterDetails(q, c, l, tl, frntImg, dt)
  mdPnt = giveMiddleOfTile(point(q,c))
  
  big = (dt[2] = "Harvester B")
  put dt[2] && big
  if (big) then
    letter = "B"
    mdPnt.locH = mdPnt.locH + 10
    eyePoint = point(75, -126)
    armPoint = point(105, 108)
  else
    letter = "A"
    eyePoint = point(37, -85)
    armPoint = point(58, 60)
  end if
  
  actualQ = q + gRenderCameraTilePos.locH
  actualC = c + gRenderCameraTilePos.locV
  lowerPart = point(0,0)
  repeat with h = actualC to gTEprops.tlMatrix[actualQ].count then
    if (gTEprops.tlMatrix[actualQ][h][l].tp = "tileHead")then
      if(gTEprops.tlMatrix[actualQ][h][l].data[2] = "Harvester Arm " & letter)then
        lowerPart = point(q, h - gRenderCameraTilePos.locV)
      end if
    end if
  end repeat
  
  if(lowerPart <> point(0,0))then
    lowerPartPos = giveMiddleOfTile(lowerPart)
    if big then 
      lowerPartPos.locH = lowerPartPos.locH + 10
    end if
  end if
  
  repeat with side = 1 to 2 then
    dr = [-1, 1][side]
    eyePastePos = mdPnt + point(eyePoint.locH*dr, eyePoint.locV)
    mem = member("Harvester" & letter & "Eye")
    qd = rotateToQuad(rect(eyePastePos, eyePastePos) + rect(-mem.width/2, -mem.height/2, mem.width/2, mem.height/2), random(360))
    
    repeat with dpth = ((l-1)*10)+3 to ((l-1)*10)+6 then
      member("layer" & dpth).image.copyPixels(mem.image, qd, mem.image.rect, {#ink:36, #color:color(0, 255, 0)})
    end repeat
    
    --    va = mdPnt + point(armPoint.loch*dr, armPoint.locV)
    --    
    --    if(lowerPart <> point(0,0))then
    --      vc = lowerPartPos
    --      if big then
    --        vc = vc + point(77*dr, 21)
    --      else
    --        vc = vc + point(48*dr, 5)
    --      end if
    --    else
    --      vc = va + point(dr*20, 200) + degToVec(random(360))*(10+random(40))
    --      repeat while ((vc.locv > va.locv + 50) and (solidAfaMv(giveGridPos(vc), l) = 1)) then
    --        vc.locV = giveMiddleOfTile(giveGridPos(vc)).locv - 11
    --      end repeat
    --    end if
    --    
    --    if big then
    --      A = 200
    --      B = 100
    --    else
    --      A = 160
    --      B = 80
    --    end if
    --    vb = InverseKinematic(vc, va, A, B, dr)
    --    
    --    
    --    repeat with seg = 1 to 2 then
    --      if(seg = 2) then
    --        p1 = vc
    --        p2 = vb
    --      else
    --        p1 = vb
    --        p2 = va
    --      end if
    --      armDir = MoveToPoint(p1, p2, 1.0)
    --      perp = giveDirFor90degrToLine(-armDir, armDir)
    --      wd = 5
    --      qd = [p1+perp*wd, p1-perp*wd, p2-perp*wd, p2+perp*wd]
    --      --  member("layer0").image.copyPixels(member("pxl").image, qd, member("pxl").image.rect, {#ink:36, #color:color(0, 0, 0)})
    --      renderBeveledImage(member("pxl").image, ((l-1)*10)+8, qd, 2)
    --      renderBeveledImage(member("pxl").image, ((l-1)*10)+9, qd, 1)
    --    end repeat
    --    
    --    armDir = MoveToPoint(vb, vc, 1.0)
    --    perp = giveDirFor90degrToLine(-armDir, armDir)
    --    wd = 6
    --    lngth = 4+2*big
    --    repeat with seg = 2 to 6 + 2*big then
    --      qd = [vb + armDir*lngth*(seg*2) - perp*wd,  vb + armDir*lngth*(seg*2) + perp*wd, vb + armDir*lngth*(seg*2+1) + perp*wd, vb + armDir*lngth*(seg*2+1) - perp*wd]
    --      renderBeveledImage(member("pxl").image, ((l-1)*10)+8, qd, 2)
    --      renderBeveledImage(member("pxl").image, ((l-1)*10)+9, qd, 1)
    --    end repeat
    --    
    --    jointRect = rect(vb,vb)+rect(-member("clampBoltGraf").image.width/2, -member("clampBoltGraf").image.height/2, member("clampBoltGraf").image.width/2, member("clampBoltGraf").image.height/2)
    --    repeat with dpth = ((l-1)*10)+7 to ((l-1)*10)+9 then
    --      member("layer"&dpth).image.copyPixels(member("clampBoltGraf").image, jointRect, member("clampBoltGraf").image.rect, {#ink:36})
    --    end repeat
    --    
    --    eyePastePos.locV = eyePastePos.locV + 50
    --    perp = giveDirFor90degrToLine(eyePastePos, vb)
    --    wd = 1.5
    --    qd = [eyePastePos+perp*wd, eyePastePos-perp*wd, vb-perp*wd, vb+perp*wd]
    --    member("layer"&(((l-1)*10)+8)).image.copyPixels(member("pxl").image, qd, rect(0,0,1,1), {#color:color(0, 255, 0)})
    
  end repeat
  
end


on renderBeveledImage(img, dp, qd, bevel)
  
  boundrect = rect(10000, 10000, -10000, -10000)
  mrgn = 10
  repeat with pnt in qd then 
    if(pnt.locH-mrgn < boundrect.left)then
      boundrect.left = pnt.locH-mrgn
    end if
    if(pnt.locH+mrgn > boundrect.right)then
      boundrect.right = pnt.locH+mrgn
    end if
    if(pnt.locV-mrgn < boundrect.top)then
      boundrect.top = pnt.locV-mrgn
    end if
    if(pnt.locV+mrgn > boundrect.bottom)then
      boundrect.bottom = pnt.locV+mrgn
    end if
    
  end repeat
  
  qdOffset = [point(boundrect.left, boundrect.top),point(boundrect.left, boundrect.top),point(boundrect.left, boundrect.top),point(boundrect.left, boundrect.top)]
  
  dumpImg = image(boundrect.width,  boundrect.height, 1)
  dumpImg.copyPixels(img, qd-qdOffset, img.rect)
  inverseImg = makeSilhoutteFromImg(dumpImg, 1)
  
  
  dumpImg = image(boundrect.width,  boundrect.width, 32)
  dumpImg.copyPixels(member("pxl").image, dumpImg.rect, rect(0,0,1,1), {#color:color(0, 255, 0)})
  
  --  member("HEJHEJ").image = inverseImg
  repeat with b = 1 to bevel then
    repeat with a in [[color(255, 0, 0), point(-1, -1)],[color(255, 0, 0), point(0, -1)],[color(255, 0, 0), point(-1, 0)], [color(0, 0, 255), point(1, 1)],[color(0, 0, 255), point(0, 1)],[color(0, 0, 255), point(1, 0)]] then
      dumpImg.copyPixels(inverseImg, dumpImg.rect+rect(a[2]*b, a[2]*b), inverseImg.rect, {#color:a[1], #ink:36})
    end repeat
  end repeat
  
  dumpImg.copyPixels(inverseImg, dumpImg.rect, inverseImg.rect, {#color:color(255, 255, 255), #ink:36})
  
  
  -- inverseImg = image( dumpImg.width,  dumpImg.height, 1)
  -- inverseImg.copyPixels(member("pxl").image, inverseImg.rect, rect(0,0,1,1))
  -- inverseImg.copyPixels(member("pxl").image, inverseImg.rect, rect(0,0,1,1), {#color:color(255, 255, 255)})
  
  -- dumpImg.copyPixels(inverseImg, dumpImg.rect, inverseImg.rect, {#color:color(255, 255, 255), #ink:36})
  
  member("layer"&string(dp)).image.copyPixels(dumpImg, boundrect, dumpImg.rect, {#ink:36})
  
  
  
end






















